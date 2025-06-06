// packages/web/pages/settings/nostr.tsx
import React, { useState, useCallback } from 'react';
import { Button } from '../../components/elements/Button';
import { Box, VStack }    from '../../components/elements/LayoutPrimitives';
import { StyledText } from '../../components/elements/StyledText';
import { SettingsLayout } from '../../components/templates/SettingsLayout';
import { FormInput, StyledLabel } from './account'; // Re-using styles from account page
import { showSuccessToast } from '../../lib/toastHelpers';

export default function NostrSettingsPage(): JSX.Element {
  const [nostrPrivateKey, setNostrPrivateKey] = useState('');
  const [nostrRelayUrl, setNostrRelayUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveNostrSettings = useCallback(() => {
    setIsSaving(true);
    console.log('Nostr Settings to save:', { nostrPrivateKey, nostrRelayUrl });
    showSuccessToast('Nostr settings save functionality not fully implemented yet.');
    // In a real scenario, you'd call a mutation here
    // For now, just simulate an async action
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  }, [nostrPrivateKey, nostrRelayUrl]);

  return (
    <SettingsLayout>
      <VStack
        css={{ width: '100%', height: '100%' }}
        distribution="start"
        alignment="center"
      >
        <VStack
          css={{
            padding: '24px',
            width: '100%',
            height: '100%',
            gap: '25px',
            minWidth: '300px',
            maxWidth: '865px',
          }}
        >
          <Box>
            <StyledText style="fixedHeadline" css={{ my: '6px' }}>
              Nostr Settings
            </StyledText>
          </Box>

          <VStack
            css={{
              padding: '24px',
              width: '100%',
              bg: '$grayBg',
              gap: '5px',
              borderRadius: '5px',
            }}
            distribution="start"
            alignment="start"
          >
            <StyledLabel htmlFor="nostrPrivateKey">Nostr Private Key (nsec)</StyledLabel>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleSaveNostrSettings();
              }}
            >
              <FormInput
                id="nostrPrivateKey"
                type="password" // Use password type for keys
                value={nostrPrivateKey}
                tabIndex={1}
                placeholder="nsec1..."
                disabled={isSaving}
                onChange={(event) => {
                  setNostrPrivateKey(event.target.value);
                }}
                css={{ mb: '10px' }}
              />
              <StyledText style="footnote" css={{ mt: '0px', mb: '20px' }}>
                Your Nostr private key (starting with nsec) is required to sign events. It will be handled with care. <strong>For this initial version, actual secure storage and usage is not yet implemented.</strong>
              </StyledText>

              <StyledLabel htmlFor="nostrRelayUrl">Default Nostr Relay URL</StyledLabel>
              <FormInput
                id="nostrRelayUrl"
                type="text"
                value={nostrRelayUrl}
                tabIndex={2}
                placeholder="wss://your-favorite-relay.com"
                disabled={isSaving}
                onChange={(event) => {
                  setNostrRelayUrl(event.target.value);
                }}
                css={{ mb: '10px' }}
              />
              <StyledText style="footnote" css={{ mt: '0px', mb: '20px' }}>
                The default Nostr relay where your data will be published and fetched from.
              </StyledText>

              <Button type="submit" style="ctaDarkYellow" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Nostr Settings'}
              </Button>
            </form>
          </VStack>
        </VStack>
      </VStack>
    </SettingsLayout>
  );
}
