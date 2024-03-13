import { styled } from '@stitches/react'
import { Button, Checkbox, Form, Input, Switch } from 'antd'
import 'antd/dist/antd.compact.css'
import Image from 'next/image'
import { useMemo } from 'react'
import {
  Box,
  HStack,
  VStack,
} from '../../../components/elements/LayoutPrimitives'
import { PageMetaData } from '../../../components/patterns/PageMetaData'
import { BetaFeature } from '../../../components/templates/BetaFeature'
import { SettingsLayout } from '../../../components/templates/SettingsLayout'
import { useGetIntegrationsQuery } from '../../../lib/networking/queries/useGetIntegrationsQuery'

// Styles
const Header = styled(Box, {
  color: '$utilityTextDefault',
  fontSize: 'x-large',
  margin: '20px',
})

export default function Notion(): JSX.Element {
  const { integrations, revalidate } = useGetIntegrationsQuery()
  const notion = useMemo(() => {
    return integrations.find((i) => i.name == 'NOTION' && i.type == 'EXPORT')
  }, [integrations])

  return (
    <>
      <PageMetaData title="Notion" path="/integrations/notion" />
      <SettingsLayout>
        <VStack
          css={{
            margin: 'auto',
            width: '80%',
          }}
        >
          <HStack>
            <Image
              src="/static/icons/notion.png"
              alt="Integration Image"
              width={75}
              height={75}
            />
            <Header>Notion integration settings</Header>
            <BetaFeature />
          </HStack>

          {notion && (
            <Form>
              <VStack
                css={{
                  padding: '20px',
                }}
              >
                <HStack>
                  <Form.Item
                    label="Notion Page Id"
                    name="parentPageId"
                    style={{ marginRight: '20px' }}
                    rules={[
                      {
                        required: true,
                        message: 'Please input your Notion Page Id!',
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>

                  <Button>Save</Button>
                </HStack>

                <Form.Item label="Notion Database Id" name="parentDatabaseId">
                  <Input disabled />
                </Form.Item>

                <Form.Item label="Automatic Sync" name="autoSync">
                  <Switch />
                </Form.Item>

                <Form.Item label="Data to Export" name="dataToExport">
                  <Checkbox.Group>
                    <Checkbox value="highlights">Highlights</Checkbox>
                    <Checkbox value="labels">Labels</Checkbox>
                    <Checkbox value="notes">Notes</Checkbox>
                  </Checkbox.Group>
                </Form.Item>

                <Button>Export Recent Items</Button>
              </VStack>
            </Form>
          )}
        </VStack>
      </SettingsLayout>
    </>
  )
}
