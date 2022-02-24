import { Box } from '../elements/LayoutPrimitives'
import {
  StyledText,
  StyledListElement,
  StyledList,
} from '../elements/StyledText'

type TermsAndConditionsProps = {
  isAppEmbed?: boolean
}

export function TermsAndConditions(
  props: TermsAndConditionsProps
): JSX.Element {
  return (
    <Box
      css={{
        bg: props.isAppEmbed ? '#ffffff00' : '$grayBase',
        px: '$1',
        py: '$3',
        mx: '$3',
        flex: 1,
        height: '100vh',
      }}
    >
      <div className="page-title">
        <StyledText style="boldHeadline">Omnivore Terms of Service</StyledText>
        <StyledText style="body" className="date">
          January 8, 2021
        </StyledText>
      </div>
      <StyledText style="headline">Scope</StyledText>
      <StyledText style="body">
        These terms govern use of the website. The operator of the website may
        offer other products and services. These terms apply only to use of the
        website.
      </StyledText>

      <StyledText style="headline">Important Terms</StyledText>
      <StyledText style="body">
        These terms include a number of especially important provisions that
        affect your rights and responsibilities, such as the disclaimers in
        Disclaimers, limits on the operator’s legal liability to you in Limits
        on Liability, your agreement to reimburse the operator for problems
        caused by your misuse of the website in Your Responsibility, and an
        agreement about how to resolve disputes in Disputes.
      </StyledText>

      <StyledText style="subHeadline">
        Your Permission to Use the Website
      </StyledText>
      <StyledText style="body">
        Subject to these terms, the operator gives you permission to use the
        website. You can’t transfer your permission to anyone else. Others need
        to agree to these terms for themselves to use the website.
      </StyledText>

      <StyledText style="subHeadline">
        Conditions for Use of the Website
      </StyledText>
      <StyledList>
        <StyledListElement>
          Your permission to use the website is subject to the following
          conditions:
        </StyledListElement>

        <StyledListElement>
          You must be at least thirteen years old.
        </StyledListElement>

        <StyledListElement>
          You may no longer use the website if the operator tells you that you
          may not.
        </StyledListElement>

        <StyledListElement>
          You must follow Acceptable Use and Content Standards.
        </StyledListElement>
      </StyledList>

      <StyledText style="subHeadline">Acceptable Use</StyledText>
      <StyledList>
        <StyledListElement>
          You may not break the law using the website.
        </StyledListElement>

        <StyledListElement>
          You may not use or try to use anyone else’s account on the website
          without their specific permission.
        </StyledListElement>

        <StyledListElement>
          You may not buy, sell, or otherwise trade in addresses, user names, or
          other unique identifiers on the website.
        </StyledListElement>

        <StyledListElement>
          You may not send advertisements, chain letters, or other solicitations
          through the website, or use the website to gather addresses for
          distribution lists.
        </StyledListElement>

        <StyledListElement>
          You may not automate access to the website, or monitor the website,
          such as with a web crawler, browser plug-in or add-on, or other
          computer program that is not a web browser. You may crawl the website
          to index it for a publicly available search engine, so long as you
          abide by the rules of any robots.txt file on the website.
        </StyledListElement>

        <StyledListElement>
          You may not use the website to send e-mail to distribution lists,
          newsgroups, or group mail aliases.
        </StyledListElement>

        <StyledListElement>
          You may not falsely imply that you’re affiliated with or endorsed by
          the operator.
        </StyledListElement>

        <StyledListElement>
          You may not show any part of the website on other websites with
          iframes or similar methods.
        </StyledListElement>

        <StyledListElement>
          You may not remove any marks showing proprietary ownership from
          materials you download from the website.
        </StyledListElement>

        <StyledListElement>
          You may not disable, avoid, or circumvent any security or access
          restrictions of the website.
        </StyledListElement>

        <StyledListElement>
          You may not strain infrastructure of the website with an unreasonable
          volume of requests, or requests designed to impose an unreasonable
          load on information systems the operator uses to provide the website.
        </StyledListElement>

        <StyledListElement>
          You may not impersonate others through the website.
        </StyledListElement>

        <StyledListElement>
          You may not encourage or help anyone in violation of these terms.
        </StyledListElement>
      </StyledList>

      <StyledText style="subHeadline">Content Standards</StyledText>
      <StyledList>
        <StyledListElement>
          You may not submit content to the website that is illegal, offensive,
          or otherwise harmful to others. This includes content that is
          harassing, inappropriate, or abusive.
        </StyledListElement>

        <StyledListElement>
          You may not submit content to the website that violates the law,
          infringes anyone’s intellectual property rights, violates anyone’s
          privacy, or breaches agreements you have with others.
        </StyledListElement>

        <StyledListElement>
          You may not submit content to the website containing malicious
          computer code, such as computer viruses or spyware.
        </StyledListElement>

        <StyledListElement>
          You may not submit content to the website as a mere placeholder to
          hold a particular address, user name, or other unique identifier.
        </StyledListElement>

        <StyledListElement>
          You may not use the website to disclose information from or about
          others that you don’t have the right to disclose.
        </StyledListElement>
      </StyledList>

      <StyledText style="subHeadline">Enforcement</StyledText>
      <StyledText style="body">
        The operator may investigate and prosecute violations of these terms to
        the fullest legal extent. The operator may notify and cooperate with law
        enforcement authorities in prosecuting violations of the law and these
        terms.
      </StyledText>

      <StyledText style="body">
        The operator reserves the right to change, redact, and delete content on
        the website for any reason. If you believe someone has submitted content
        to the website in violation of these terms, contact the operator
        immediately. See Contact.
      </StyledText>

      <StyledText style="subHeadline">Your Account</StyledText>
      <StyledText style="body">
        You must create and log into an account to use some features of the
        website.
      </StyledText>

      <StyledText style="body">
        To create an account, you must provide some information about yourself.
        If you create an account, you agree to provide, at a minimum, a valid
        e-mail address, and to keep that address up-to-date. You may close your
        account at any time.
      </StyledText>
      <StyledText style="body">
        You agree to be responsible for everything done with your account,
        whether authorized by you or not, until you either close your account or
        notify the operator that your account has been compromised. You agree to
        notify the operator immediately if you suspect your account has been
        compromised. You agree to select a secure password for your account, and
        keep it secret.
      </StyledText>

      <StyledText style="body">
        The operator may restrict, suspend, or close your account on the website
        according to its policy for handling copyright-related takedown
        requests, or if the operator reasonably believes that you’ve breached
        these terms.
      </StyledText>

      <StyledText style="subHeadline">Your Content</StyledText>
      <StyledText style="body">
        Nothing in these terms gives the operator any ownership rights in
        content or intellectual property that you share with the website, such
        as your account information and content you submit to the website.
        Nothing in these terms gives you any ownership rights in the operator’s
        content or intellectual property, either.
      </StyledText>

      <StyledText style="body">
        Between you and the operator, you remain solely responsible for content
        you submit to the website. You agree not to wrongly imply that content
        you submit to the website is from, sponsored by, or approved by the
        operator. These terms do not obligate the operator to store, maintain,
        or provide copies of content you submit.
      </StyledText>

      <StyledText style="body">
        Content you submit to the website belongs to you, and you decide how to
        license it to others. But at a minimum, you license the operator to
        provide content that you submit to the website to other users of the
        website. That special license allows the operator to copy, publish, and
        analyze content you submit to the website.
      </StyledText>

      <StyledText style="body">
        When content you submit is removed from the website, whether by you or
        by the operator, the operator’s special license ends when the last copy
        disappears from the operator’s backups, caches, and other systems. Other
        licenses you give for your content may continue after your content is
        removed. Those licenses may give others, or the operator itself, the
        right to share your content through the website again.
      </StyledText>

      <StyledText style="body">
        Others who receive content you submit to the website may violate the
        terms on which you license your content. You agree that the operator
        will not be liable to you for those violations or their consequences.
      </StyledText>

      <StyledText style="subHeadline">Your Responsibility</StyledText>
      <StyledText style="body">
        You agree to reimburse the operator for all the costs of legal claims by
        others related to your breach of these terms, or breach of these terms
        by others using your account. Both you and the operator agree to notify
        the other side of any legal claims you might have to reimburse the
        operator for as soon as possible. If the operator fails to notify you of
        a legal claim promptly, you won’t have to reimburse the operator for
        costs that you could have defended against or lessened with prompt
        notice. You agree to allow the operator to take over investigation,
        defense, and settlement of legal claims you would have to reimburse the
        operator for, and to cooperate with those efforts. The operator agrees
        not to enter any settlement that admits you were at fault or requires
        you to do anything without your permission.
      </StyledText>

      <StyledText style="subHeadline">Disclaimers</StyledText>
      <StyledText style="body">
        You accept all risk of using the website and it content. As far as the
        law allows, the operator provides the website and its content as is,
        without any warranty whatsoever.
      </StyledText>

      <StyledText style="body">
        The website may hyperlink to and integrate websites and services run by
        others. The operator does not make any warranty about services run by
        others, or content they may provide. Use of services run by others may
        be governed by other terms between you and the one running service.
      </StyledText>

      <StyledText style="subHeadline">Limits on Liability</StyledText>
      <StyledText style="body">
        The operator will not be liable to you for breach-of-contract damages
        operator personnel could not have reasonably foreseen when you agreed to
        these terms.
      </StyledText>

      <StyledText style="body">
        As far as the law allows, the operator’s total liability to you for
        claims of any kind that are related to the website or its content will
        be limited to $50.
      </StyledText>

      <StyledText style="subHeadline">Feedback</StyledText>
      <StyledText style="body">
        The operator welcomes your feedback and suggestions for the website. See
        Contact.
      </StyledText>

      <StyledText style="body">
        You agree that the operator will be free to act on feedback and
        suggestions you provide, and that the operator won’t have to notify you
        that your feedback was used, get your permission to use it, or pay you
        for it. You agree not to submit feedback or suggestions that you believe
        might be confidential or proprietary, to you or others.
      </StyledText>

      <StyledText style="subHeadline">Termination</StyledText>
      <StyledText style="body">
        Either you or the operator may end this agreement at any time. When this
        agreement ends, your permission to use the website also ends.
      </StyledText>
      <StyledText style="body">
        The following sections continue after this agreement ends: Your Content,
        Feedback, Your Responsibility, Disclaimers, Limits on Liability, and
        General Terms.
      </StyledText>

      <StyledText style="subHeadline">Disputes</StyledText>
      <StyledText style="body">
        The governing law will govern these terms and all legal proceedings
        related to these terms or your use of the website. If the operator
        doesn’t say what the governing law is, it’s the law under which the
        operator’s legal entity is formed. If the operator doesn’t have a legal
        entity, it’s the law of the state where the operator is based.
      </StyledText>

      <StyledText style="body">
        Both sides agree to bring legal any proceedings related to this
        agreement only in the national and any national-subdivision courts
        located in the forum for disputes. If the operator doesn’t say what the
        forum for disputes is, it’s the city with state and federal courts in
        the state of the governing law that is closest to where the operator is
        based. If the operator isn’t based in that state, the forum for disputes
        is the capital of that state.
      </StyledText>

      <StyledText style="body">
        Neither you nor the operator will object to jurisdiction, forum, or
        venue in those courts.
      </StyledText>

      <StyledText style="body">
        If the governing law allows, both sides waive their rights to trial by
        jury.
      </StyledText>

      <StyledText style="body">
        Both sides agree to bring any legal claims related to this agreement as
        individuals, not as part of a class action or other representative
        proceeding.
      </StyledText>

      <StyledText style="headline">General Terms </StyledText>
      <StyledText style="body">
        If a section of these terms is unenforceable as written, but could be
        changed to make it enforceable, that section should be changed to the
        minimum extent necessary to make it enforceable. Otherwise, that section
        should be removed, and the others should be enforced as written.
      </StyledText>

      <StyledText style="body">
        You may not assign this agreement. The operator may assign this
        agreement to any affiliate of the operator, any other company that
        obtains control of the operator, or any other company that buys assets
        of the operator related to the website. Any attempt to assign against
        these terms has no legal effect.
      </StyledText>

      <StyledText style="body">
        Neither the exercise of any right under this agreement, nor waiver of
        any breach of this agreement, waives any other breach of this agreement.
      </StyledText>

      <StyledText style="body">
        These terms, plus the terms on any page incorporating them by reference,
        are all the terms of agreement between you and the operator about use of
        the website. This agreement entirely replaces any other agreements about
        your use of the website, written or not.
      </StyledText>
      <StyledText style="subHeadline">Contact</StyledText>
      <StyledText style="body">
        You may notify the operator under these terms, and send questions to the
        operator, using the contact information they provide.
      </StyledText>

      <StyledText style="body">
        The operator may notify you under these terms using the e-mail address
        you provide for your account on the website, or by posting a message to
        the homepage of the website or your account page.
      </StyledText>

      <StyledText style="subHeadline">Changes</StyledText>
      <StyledText style="body">
        The operator may update the terms of service for the website. The
        operator will post all updates to the website. For updates with
        substantial changes, the operator agrees to e-mail you if you’ve created
        an account and provided a valid e-mail address. The operator may also
        announce updates with special messages or alerts on the website.
      </StyledText>

      <StyledText style="body">
        Once you get notice of an update to these terms, you must agree to the
        new terms in order to keep using the website.
      </StyledText>
    </Box>
  )
}
