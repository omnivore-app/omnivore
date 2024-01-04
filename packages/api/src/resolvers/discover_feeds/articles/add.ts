import { authorized } from '../../../utils/helpers'
import {
  InputMaybe,
  MutationSaveDiscoverArticleArgs,
  SaveDiscoverArticleError,
  SaveDiscoverArticleErrorCode,
  SaveDiscoverArticleSuccess,
  SaveSuccess,
} from '../../../generated/graphql'
import { appDataSource } from '../../../data_source'
import { QueryRunner } from 'typeorm'
import { userRepository } from '../../../repository/user'
import { saveUrl } from '../../../services/save_url'
import { v4 } from 'uuid'

export const saveDiscoverArticleResolver = authorized<
  SaveDiscoverArticleSuccess,
  SaveDiscoverArticleError,
  MutationSaveDiscoverArticleArgs
>(
  async (
    _,
    { input: { discoverArticleId, timezone, locale } },
    { uid, log },
  ) => {
    try {
      const queryRunner = (await appDataSource
        .createQueryRunner()
        .connect()) as QueryRunner

      const user = await userRepository.findById(uid)
      if (!user) {
        return {
          __typename: 'SaveDiscoverArticleError',
          errorCodes: [SaveDiscoverArticleErrorCode.Unauthorized],
        }
      }

      const { rows: discoverArticles } = (await queryRunner.query(
        `SELECT url FROM omnivore.discover_feed_articles WHERE id=$1`,
        [discoverArticleId],
      )) as {
        rows: {
          url: string
        }[]
      }

      if (discoverArticles.length != 1) {
        return {
          __typename: 'SaveDiscoverArticleError',
          errorCodes: [SaveDiscoverArticleErrorCode.NotFound],
        }
      }

      const url = discoverArticles[0].url
      const savedArticle = await saveUrl(
        {
          url,
          source: 'add-link',
          clientRequestId: v4(),
          locale: locale as InputMaybe<string>,
          timezone: timezone as InputMaybe<string>,
        },
        user,
      )

      if (savedArticle.__typename == 'SaveError') {
        return {
          __typename: 'SaveDiscoverArticleError',
          errorCodes: [SaveDiscoverArticleErrorCode.BadRequest],
        }
      }

      const saveSuccess = savedArticle as SaveSuccess

      await queryRunner.query(
        `insert into omnivore.discover_feed_save_link (discover_article_id, user_id, article_save_id, article_save_url) VALUES ($1, $2, $3, $4) ON CONFLICT ON CONSTRAINT user_discover_feed_link DO UPDATE SET (article_save_id, article_save_url, deleted) = ($3, $4, false);`,
        [discoverArticleId, uid, saveSuccess.clientRequestId, saveSuccess.url],
      )

      await queryRunner.release()

      return {
        __typename: 'SaveDiscoverArticleSuccess',
        url: saveSuccess.url,
        saveId: saveSuccess.clientRequestId,
      }
    } catch (error) {
      log.error('Error Saving Article', error)

      return {
        __typename: 'SaveDiscoverArticleError',
        errorCodes: [SaveDiscoverArticleErrorCode.Unauthorized],
      }
    }
  },
)
