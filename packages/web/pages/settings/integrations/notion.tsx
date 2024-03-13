import { styled } from '@stitches/react'
import {
  Button,
  Checkbox,
  Form,
  FormProps,
  Input,
  message,
  Space,
  Switch,
} from 'antd'
import 'antd/dist/antd.compact.css'
import { CheckboxValueType } from 'antd/lib/checkbox/Group'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import {
  Box,
  HStack,
  VStack,
} from '../../../components/elements/LayoutPrimitives'
import { PageMetaData } from '../../../components/patterns/PageMetaData'
import { Beta } from '../../../components/templates/Beta'
import { SettingsLayout } from '../../../components/templates/SettingsLayout'
import { deleteIntegrationMutation } from '../../../lib/networking/mutations/deleteIntegrationMutation'
import { setIntegrationMutation } from '../../../lib/networking/mutations/setIntegrationMutation'
import { useGetIntegrationsQuery } from '../../../lib/networking/queries/useGetIntegrationsQuery'
import { applyStoredTheme } from '../../../lib/themeUpdater'
import { showSuccessToast } from '../../../lib/toastHelpers'

interface FieldData {
  name: string | number | (string | number)[]
  value?: any
  checked?: boolean
  validating?: boolean
  errors?: string[]
}

type FieldType = {
  parentPageId?: string
  parentDatabaseId?: string
  autoSync?: boolean
  properties?: string[]
}

// Styles
const Header = styled(Box, {
  color: '$utilityTextDefault',
  fontSize: 'x-large',
  margin: '20px 20px 40px 40px',
})

export default function Notion(): JSX.Element {
  applyStoredTheme()

  const router = useRouter()
  const { integrations, revalidate } = useGetIntegrationsQuery()
  const notion = useMemo(
    () => integrations.find((i) => i.name == 'NOTION' && i.type == 'EXPORT'),
    [integrations]
  )
  const fields = useMemo<FieldData[]>(
    () => [
      {
        name: 'parentPageId',
        value: notion?.settings?.parentPageId,
      },
      {
        name: 'parentDatabaseId',
        value: notion?.settings?.parentDatabaseId,
      },
      {
        name: 'autoSync',
        value: notion?.settings?.autoSync,
      },
      {
        name: 'properties',
        value: notion?.settings?.properties,
      },
    ],
    [notion]
  )

  const [form] = Form.useForm<FieldType>()
  const [messageApi, contextHolder] = message.useMessage()

  const deleteNotion = async () => {
    if (!notion) {
      throw new Error('Notion integration not found')
    }

    await deleteIntegrationMutation(notion.id)
    showSuccessToast('Notion integration disconnected successfully.')

    router.push('/settings/integrations')
  }

  const updateNotion = async (values: FieldType) => {
    if (!notion) {
      throw new Error('Notion integration not found')
    }

    await setIntegrationMutation({
      id: notion.id,
      name: notion.name,
      type: notion.type,
      token: notion.token,
      enabled: notion.enabled,
      settings: values,
    })
  }

  const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
    try {
      await updateNotion(values)

      revalidate()
      messageApi.success('Notion settings updated successfully.')
    } catch (error) {
      messageApi.error('There was an error updating Notion settings.')
    }
  }

  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (
    errorInfo
  ) => {
    console.log('Failed:', errorInfo)
  }

  const onDataChange = (value: Array<CheckboxValueType>) => {
    form.setFieldsValue({ properties: value.map((v) => v.toString()) })
  }

  return (
    <>
      {contextHolder}
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
            <Beta />
          </HStack>

          <Form
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 6 }}
            labelAlign="left"
            style={{ width: '100%' }}
            form={form}
            fields={fields}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
          >
            <Form.Item<FieldType>
              label="Notion Page Id"
              name="parentPageId"
              rules={[
                {
                  required: true,
                  message: 'Please input your Notion Page Id!',
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item<FieldType>
              label="Notion Database Id"
              name="parentDatabaseId"
              hidden
            >
              <Input disabled />
            </Form.Item>

            <Form.Item<FieldType>
              label="Automatic Sync"
              name="autoSync"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item<FieldType>
              label="Properties to Export"
              name="properties"
            >
              <Checkbox.Group onChange={onDataChange}>
                <Checkbox value="highlights">Highlights</Checkbox>
                <Checkbox value="labels">Labels</Checkbox>
                <Checkbox value="notes">Notes</Checkbox>
              </Checkbox.Group>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Save
              </Button>
            </Form.Item>
          </Form>

          <Space>
            <Button type="primary">Export Recent Items</Button>
            <Button type="primary" danger onClick={deleteNotion}>
              Disconnect
            </Button>
          </Space>
        </VStack>
      </SettingsLayout>
    </>
  )
}
