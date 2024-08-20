import { Button, Form, FormProps, Input, message, Space, Spin } from 'antd'
import 'antd/dist/antd.compact.css'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import { HStack, VStack } from '../../../components/elements/LayoutPrimitives'
import { PageMetaData } from '../../../components/patterns/PageMetaData'
import { Header } from '../../../components/templates/settings/SettingsTable'
import { SettingsLayout } from '../../../components/templates/SettingsLayout'
import { deleteIntegrationMutation } from '../../../lib/networking/mutations/deleteIntegrationMutation'
import {
  exportToIntegrationMutation,
  Task,
  TaskState,
} from '../../../lib/networking/mutations/exportToIntegrationMutation'
import {
  SetIntegrationErrorCode,
  setIntegrationMutation,
} from '../../../lib/networking/mutations/setIntegrationMutation'
import { apiFetcher } from '../../../lib/networking/networkHelpers'
import { useGetIntegrationQuery } from '../../../lib/networking/queries/useGetIntegrationQuery'
import { showSuccessToast } from '../../../lib/toastHelpers'

type FieldType = {
  parentDatabaseId: string
  properties?: string[]
}

export default function Notion(): JSX.Element {
  const router = useRouter()
  const { integration: notion, revalidate } = useGetIntegrationQuery('notion')

  const [form] = Form.useForm<FieldType>()
  const [messageApi, contextHolder] = message.useMessage()
  const [exporting, setExporting] = useState(!!notion.taskName)

  useEffect(() => {
    form.setFieldsValue({
      parentDatabaseId: notion.settings?.parentDatabaseId,
      properties: notion.settings?.properties,
    })
  }, [form, notion])

  const deleteNotion = useCallback(async () => {
    await deleteIntegrationMutation(notion.id)
    showSuccessToast('Notion integration disconnected successfully.')

    revalidate()
    router.push('/settings/integrations')
  }, [notion.id, router])

  const updateNotion = async (values: FieldType) => {
    await setIntegrationMutation({
      id: notion.id,
      name: notion.name,
      type: notion.type,
      token: notion.token,
      enabled: true,
      settings: values,
    })
  }

  const normalizeDatabaseId = useCallback(
    (value: string) => {
      // check if database id is in UUIDv4 format
      const uuidRegex =
        /^[0-9a-fA-F]{8}[0-9a-fA-F]{4}[0-9a-fA-F]{4}[0-9a-fA-F]{4}[0-9a-fA-F]{12}$/
      if (uuidRegex.test(value)) {
        return value
      }

      // extract the database id from the URL
      // https://www.notion.so/ec460c235baa4da5bb412971a12e9dbe?v=8f4e324c0b584b67b8b7cfe9a2f996d7 -> ec460c235baa4da5bb412971a12e9dbe
      const urlRegex = /https:\/\/www.notion.so\/([a-f0-9]{32})\?*/
      const match = value.match(urlRegex)
      if (!match || match.length < 2) {
        messageApi.error('Invalid Notion Database ID.')
        return value
      }
      return match[1]
    },
    [messageApi]
  )

  const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
    try {
      await updateNotion(values)

      revalidate()
      messageApi.success('Notion settings updated successfully.')
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === SetIntegrationErrorCode.NotFound
      ) {
        return messageApi.error('Notion database not found. Please make sure if you are using database ID instead of page ID.')
      }

      messageApi.error('There was an error updating Notion settings.')
    }
  }

  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (
    errorInfo
  ) => {
    console.log('Failed:', errorInfo)
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
  }, [exporting, messageApi, notion])

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
                  label="Notion Database ID"
                  name="parentDatabaseId"
                  help="The ID of the Notion database where the items will be exported to. You can find it in the URL of the database."
                  normalize={normalizeDatabaseId}
                  rules={[
                    {
                      required: true,
                      message: 'Please input your Notion Database ID!',
                    },
                    {
                      validator: (_, value) => {
                        // check if database id is in UUIDv4 format
                        const uuidRegex = /^[0-9a-fA-F]{8}[0-9a-fA-F]{4}[0-9a-fA-F]{4}[0-9a-fA-F]{4}[0-9a-fA-F]{12}$/
                        if (uuidRegex.test(value)) {
                          return Promise.resolve()
                        }
                        // extract the database id from the URL
                        const urlRegex =
                          /https:\/\/www.notion.so\/([a-f0-9]{32})\?*/
                        const match = value.match(urlRegex)
                        if (match && match.length >= 2) {
                          return Promise.resolve()
                        }
                        return Promise.reject(
                          new Error('Invalid Notion Database ID.')
                        )
                      },
                    },
                  ]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  wrapperCol={{ offset: 6 }}
                  style={{ marginTop: '30px' }}
                >
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
