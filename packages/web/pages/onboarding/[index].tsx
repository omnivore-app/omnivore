import { useRouter } from "next/router";
import { OnboardingAddNewsletters } from "../../components/templates/onboarding/OnboardingAddNewsletters";
import { OnboardingInstallInstructions } from "../../components/templates/onboarding/OnboardingInstallInstructions";
import { OnboardingJoinCommunity } from "../../components/templates/onboarding/OnboardingJoinCommunity";
import { OnboardingReaderPreview } from "../../components/templates/onboarding/OnboardingReaderPreview";

export default function Onboarding() {
  const router = useRouter();
  const { index: pageNumber } = router.query;

  switch (pageNumber) {
    case "01":
      return <OnboardingReaderPreview pageNumber={1} />;
    case "02":
      return <OnboardingInstallInstructions pageNumber={2} />;
    case "03":
      return <OnboardingAddNewsletters pageNumber={3} />;
    case "04":
      return <OnboardingJoinCommunity pageNumber={4} />;
  }

  return <OnboardingReaderPreview pageNumber={1} />
}
