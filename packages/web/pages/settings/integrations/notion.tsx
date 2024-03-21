import {
  Button,
  Checkbox,
  Form,
  FormProps,
  Input,
  message,
  Space,
  Spin,
  Switch,
} from 'antd'
import 'antd/dist/antd.compact.css'
import { CheckboxValueType } from 'antd/lib/checkbox/Group'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import { HStack, VStack } from '../../../components/elements/LayoutPrimitives'
import { PageMetaData } from '../../../components/patterns/PageMetaData'
import { Beta } from '../../../components/templates/Beta'
import { Header } from '../../../components/templates/settings/SettingsTable'
import { SettingsLayout } from '../../../components/templates/SettingsLayout'
import { deleteIntegrationMutation } from '../../../lib/networking/mutations/deleteIntegrationMutation'
import {
  exportToIntegrationMutation,
  Task,
  TaskState,
} from '../../../lib/networking/mutations/exportToIntegrationMutation'
import { setIntegrationMutation } from '../../../lib/networking/mutations/setIntegrationMutation'
import { apiFetcher } from '../../../lib/networking/networkHelpers'
import { useGetIntegrationQuery } from '../../../lib/networking/queries/useGetIntegrationQuery'
import { applyStoredTheme } from '../../../lib/themeUpdater'
import { showSuccessToast } from '../../../lib/toastHelpers'

type FieldType = {
  parentPageId?: string
  parentDatabaseId?: string
  enabled: boolean
  properties?: string[]
}

export default function Notion(): JSX.Element {
  applyStoredTheme()

  const router = useRouter()
  const { integration: notion, revalidate } = useGetIntegrationQuery('notion')

  const [form] = Form.useForm<FieldType>()
  const [messageApi, contextHolder] = message.useMessage()
  const [exporting, setExporting] = useState(!!notion.taskName)

  useEffect(() => {
    form.setFieldsValue({
      parentPageId: notion.settings?.parentPageId,
      parentDatabaseId: notion.settings?.parentDatabaseId,
      enabled: notion.enabled,
      properties: notion.settings?.properties,
    })
  }, [form, notion])

  const deleteNotion = async () => {
    await deleteIntegrationMutation(notion.id)
    showSuccessToast('Notion integration disconnected successfully.')

    revalidate()
    router.push('/settings/integrations')
  }

  const updateNotion = async (values: FieldType) => {
    await setIntegrationMutation({
      id: notion.id,
      name: notion.name,
      type: notion.type,
      token: notion.token,
      enabled: values.enabled,
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

  const exportToNotion = useCallback(async () => {
    if (exporting) {
      messageApi.warning('Exporting process is already running.')
      return
    }

    try {
      const task = await exportToIntegrationMutation(notion.id)
      // long polling to check the status of the task in every 10 seconds
      setExporting(true)
      const interval = setInterval(async () => {
        const updatedTask = (await apiFetcher(`/api/tasks/${task.id}`)) as Task
        if (updatedTask.state === TaskState.Succeeded) {
          clearInterval(interval)
          setExporting(false)
          messageApi.success('Exported to Notion successfully.')
          return
        }
        if (updatedTask.state === TaskState.Failed) {
          clearInterval(interval)
          setExporting(false)
          messageApi.error('There was an error exporting to Notion.')
          return
        }
      }, 10000)
      messageApi.info('Exporting to Notion...')
    } catch (error) {
      messageApi.error('There was an error exporting to Notion.')
    }
  }, [exporting, messageApi, notion.id])

  return (
    <>
      {contextHolder}
      <PageMetaData title="Notion" path="/integrations/notion" />
      <SettingsLayout>
        <VStack
          distribution="start"
          alignment="start"
          css={{
            margin: '0 auto',
            width: '80%',
            height: '500px',
          }}
        >
          <HStack
            alignment="start"
            distribution="start"
            css={{
              width: '100%',
              pb: '$2',
              borderBottom: '1px solid $utilityTextDefault',
              pr: '$1',
            }}
          >
            <Image
              src="/static/icons/notion.png"
              alt="Integration Image"
              width={75}
              height={75}
            />
            <Header>Notion integration settings</Header>
            <Beta />
          </HStack>

          <div style={{ width: '100%', marginTop: '40px' }}>
            <Spin spinning={exporting} tip="Exporting" size="large">
              <Form
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 8 }}
                labelAlign="left"
                form={form}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
              >
                <Form.Item<FieldType>
                  label="Notion Page Id"
                  name="parentPageId"
                  help="The id of the Notion page where the items will be exported to. You can find it in the URL of the page."
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
                  name="enabled"
                  valuePropName="checked"
                  help="Once connected all new items will be exported to Notion"
                >
                  <Switch />
                </Form.Item>

                <Form.Item<FieldType>
                  label="Properties to Export"
                  name="properties"
                >
                  <Checkbox.Group onChange={onDataChange}>
                    <Checkbox value="highlights">Highlights</Checkbox>
                  </Checkbox.Group>
                </Form.Item>

                <Form.Item>
                  <Space>
                    <Button type="primary" htmlType="submit">
                      Save
                    </Button>
                    <Button type="primary" danger onClick={deleteNotion}>
                      Disconnect
                    </Button>
                  </Space>
                </Form.Item>
              </Form>

              <Button
                type="primary"
                onClick={exportToNotion}
                disabled={exporting}
              >
                {exporting ? 'Exporting' : 'Export last 100 items'}
              </Button>
            </Spin>
          </div>
        </VStack>
      </SettingsLayout>
    </>
  )
}
