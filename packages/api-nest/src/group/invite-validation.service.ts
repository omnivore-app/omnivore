import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, EntityManager } from 'typeorm'
import { Invite } from './entities/invite.entity'
import { GroupMembership } from './entities/group-membership.entity'

export interface InviteValidationResult {
  isValid: boolean
  invite?: Invite
  reason?: string
}

@Injectable()
export class InviteValidationService {
  private readonly logger = new Logger(InviteValidationService.name)

  constructor(
    @InjectRepository(Invite)
    private readonly inviteRepository: Repository<Invite>,
    @InjectRepository(GroupMembership)
    private readonly membershipRepository: Repository<GroupMembership>,
  ) {}

  /**
   * Validate an invite code and return the invite if valid
   */
  async validateInviteCode(
    inviteCode: string,
    entityManager?: EntityManager,
  ): Promise<InviteValidationResult> {
    const inviteRepo = entityManager
      ? entityManager.getRepository(Invite)
      : this.inviteRepository

    const membershipRepo = entityManager
      ? entityManager.getRepository(GroupMembership)
      : this.membershipRepository

    try {
      // Find the invite with its group
      const invite = await inviteRepo.findOne({
        where: { code: inviteCode },
        relations: ['group'],
      })

      if (!invite) {
        this.logger.debug(`Invite not found: ${inviteCode}`)
        return {
          isValid: false,
          reason: 'INVITE_NOT_FOUND',
        }
      }

      // Check if invite has expired
      if (invite.expirationTime < new Date()) {
        this.logger.log('Rejecting invite - expired', {
          inviteCode,
          expirationTime: invite.expirationTime,
        })
        return {
          isValid: false,
          invite,
          reason: 'INVITE_EXPIRED',
        }
      }

      // Check if invite has reached max members
      const memberCount = await membershipRepo.count({
        where: { inviteId: invite.id },
      })

      if (memberCount >= invite.maxMembers) {
        this.logger.log('Rejecting invite - max members reached', {
          inviteCode,
          memberCount,
          maxMembers: invite.maxMembers,
        })
        return {
          isValid: false,
          invite,
          reason: 'INVITE_MAX_MEMBERS_REACHED',
        }
      }

      this.logger.debug(`Invite validated successfully: ${inviteCode}`)
      return {
        isValid: true,
        invite,
      }
    } catch (error) {
      this.logger.error(`Error validating invite: ${inviteCode}`, error)
      return {
        isValid: false,
        reason: 'INVITE_VALIDATION_ERROR',
      }
    }
  }

  /**
   * Create a group membership for a user with a validated invite
   */
  async createGroupMembership(
    userId: string,
    invite: Invite,
    entityManager: EntityManager,
    isAdmin = false,
  ): Promise<GroupMembership> {
    const membershipRepo = entityManager.getRepository(GroupMembership)

    const membership = membershipRepo.create({
      userId,
      groupId: invite.groupId,
      inviteId: invite.id,
      isAdmin,
    })

    return membershipRepo.save(membership)
  }
}
