import { styled } from '@stitches/react'
import { Button, Checkbox, Form, FormProps, Input, Space, Switch } from 'antd'
import 'antd/dist/antd.compact.css'
import { CheckboxValueType } from 'antd/lib/checkbox/Group'
import Image from 'next/image'
import { useMemo } from 'react'
import {
  Box,
  HStack,
  VStack,
} from '../../../components/elements/LayoutPrimitives'
import { PageMetaData } from '../../../components/patterns/PageMetaData'
import { Beta } from '../../../components/templates/Beta'
import { SettingsLayout } from '../../../components/templates/SettingsLayout'
import { useGetIntegrationsQuery } from '../../../lib/networking/queries/useGetIntegrationsQuery'

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
  const { integrations, revalidate } = useGetIntegrationsQuery()
  const fields = useMemo<FieldData[]>(() => {
    const notion = integrations.find(
      (i) => i.name == 'NOTION' && i.type == 'EXPORT'
    )
    return [
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
        checked: notion?.settings?.autoSync,
      },
      {
        name: 'properties',
        value: notion?.settings?.properties,
      },
    ]
  }, [integrations])

  const [form] = Form.useForm<FieldType>()

  const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
    console.log('Success:', values)
  }

  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (
    errorInfo
  ) => {
    console.log('Failed:', errorInfo)
  }

  const onDataChange = (value: Array<CheckboxValueType>) => {
    form.setFieldsValue({ properties: value.map((v) => v.toString()) })
    form.submit()
  }

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
              <Space>
                <Input />
                <Button type="primary" htmlType="submit">
                  Save
                </Button>
              </Space>
            </Form.Item>

            <Form.Item<FieldType>
              label="Notion Database Id"
              name="parentDatabaseId"
              hidden
            >
              <Input disabled />
            </Form.Item>

            <Form.Item<FieldType> label="Automatic Sync" name="autoSync">
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
          </Form>

          <Space>
            <Button type="primary">Export Recent Items</Button>
            <Button type="primary" danger>
              Disconnect
            </Button>
          </Space>
        </VStack>
      </SettingsLayout>
    </>
  )
}
