import { Button, Form, Input, Modal, Select, Space, Table, Tag } from 'antd'
// import 'antd/dist/antd.dark.css'
import 'antd/dist/antd.compact.css'
import { useCallback, useMemo, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { Box, HStack } from '../../components/elements/LayoutPrimitives'
import { SettingsLayout } from '../../components/templates/SettingsLayout'
import { Label } from '../../lib/networking/fragments/labelFragment'
import { deleteRuleMutation } from '../../lib/networking/mutations/deleteRuleMutation'
import { setRuleMutation } from '../../lib/networking/mutations/setRuleMutation'
import { useGetLabelsQuery } from '../../lib/networking/queries/useGetLabelsQuery'
import {
  Rule,
  RuleAction,
  RuleActionType,
  RuleEventType,
  useGetRulesQuery,
} from '../../lib/networking/queries/useGetRulesQuery'
import { applyStoredTheme } from '../../lib/themeUpdater'
import { showErrorToast, showSuccessToast } from '../../lib/toastHelpers'

type CreateRuleModalProps = {
  isModalOpen: boolean
  setIsModalOpen: (isOpen: boolean) => void
  revalidate: () => void
}

const CreateRuleModal = (props: CreateRuleModalProps): JSX.Element => {
  const [form] = Form.useForm()

  const onOk = async (values: any) => {
    const name = form.getFieldValue('name')
    const filter = form.getFieldValue('filter')
    const eventTypes = form.getFieldValue('eventTypes')
    await setRuleMutation({
      name,
      filter,
      actions: [],
      enabled: true,
      eventTypes,
    })
    form.resetFields()
    props.setIsModalOpen(false)
    props.revalidate()
    showSuccessToast('Rule created')
  }

  const onCancel = (errorInfo: any) => {
    form.resetFields()
    props.setIsModalOpen(false)
  }

  return (
    <Modal
      title="Create Rule"
      open={props.isModalOpen}
      onOk={form.submit}
      onCancel={onCancel}
      destroyOnClose={true}
    >
      <Form
        form={form}
        name="createRule"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        onFinish={onOk}
        // onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: 'Please enter the rule name.' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Filter"
          name="filter"
          rules={[{ required: true, message: 'Please enter the rule filter' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="When"
          name="eventTypes"
          rules={[
            {
              required: true,
              message: 'Please select when the rule will be triggered',
            },
          ]}
        >
          <Select
            mode="multiple"
            allowClear
            placeholder="Please select when the rule will be triggered"
          >
            {Object.keys(RuleEventType).map((key: string, index: number) => {
              const value = Object.values(RuleEventType)[index]
              return (
                <Select.Option key={key} value={value}>
                  {key}
                </Select.Option>
              )
            })}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  )
}

type CreateActionModalProps = {
  rule: Rule | undefined
  setIsModalOpen: (isOpen: boolean) => void
  revalidate: () => void
}

const CreateActionModal = (props: CreateActionModalProps): JSX.Element => {
  const [form] = Form.useForm()
  const { labels } = useGetLabelsQuery()

  const onOk = async (values: any) => {
    const actionType = form.getFieldValue('actionType') as RuleActionType
    const params =
      actionType == RuleActionType.AddLabel ? form.getFieldValue('labels') : []
    if (props.rule) {
      await setRuleMutation({
        id: props.rule.id,
        name: props.rule.name,
        filter: props.rule.filter,
        enabled: props.rule.enabled,
        actions: [
          ...props.rule.actions,
          {
            type: actionType,
            params: params,
          },
        ],
        eventTypes: props.rule.eventTypes,
      })
      form.resetFields()
      props.setIsModalOpen(false)
      props.revalidate()
      showSuccessToast('Action created')
    }
  }

  const [actionType, setActionType] =
    useState<RuleActionType | undefined>(undefined)

  return (
    <Modal
      title="Create Action"
      open={props.rule != undefined}
      onOk={form.submit}
      onCancel={() => {
        form.resetFields()
        props.setIsModalOpen(false)
      }}
    >
      <Form
        form={form}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        autoComplete="off"
        onFinish={onOk}
      >
        <Form.Item
          label="Action"
          name="actionType"
          rules={[{ required: true, message: 'Please choose an action' }]}
        >
          <Select
            onSelect={(value) => {
              console.log('setting action type', value)
              setActionType(value)
            }}
          >
            {Object.keys(RuleActionType).map((key: string, index: number) => {
              const value = Object.values(RuleActionType)[index]
              return (
                <Select.Option key={key} value={value}>
                  {key}
                </Select.Option>
              )
            })}
          </Select>
        </Form.Item>
        {actionType == RuleActionType.AddLabel && (
          <Form.Item
            label="Labels"
            name="labels"
            rules={[
              { required: true, message: 'Please choose at least one label' },
            ]}
          >
            <Select mode="multiple">
              {labels.map((label) => {
                return (
                  <Select.Option key={label.id} value={label.id}>
                    {label.name}
                  </Select.Option>
                )
              })}
            </Select>
          </Form.Item>
        )}
      </Form>
    </Modal>
  )
}

export default function Rules(): JSX.Element {
  const { rules, revalidate } = useGetRulesQuery()
  const { labels } = useGetLabelsQuery()
  const [isCreateRuleModalOpen, setIsCreateRuleModalOpen] = useState(false)
  const [createActionRule, setCreateActionRule] =
    useState<Rule | undefined>(undefined)

  const dataSource = useMemo(() => {
    return rules.map((rule: Rule) => {
      return {
        rule: rule,
        name: rule.name,
        filter: rule.filter,
        actions: rule.actions,
        eventTypes: rule.eventTypes,
      }
    })
  }, [rules])

  applyStoredTheme()

  const deleteRule = useCallback(
    async (rule: Rule) => {
      if (!(await deleteRuleMutation(rule.id))) {
        showErrorToast('Error deleting rule')
      } else {
        showSuccessToast('Rule deleted')
      }
      revalidate()
    },
    [rules, revalidate]
  )

  const stringForActionParam = useCallback(
    (actionType: RuleActionType, param: string): string => {
      if (actionType === RuleActionType.AddLabel) {
        if (!labels) {
          return ''
        }
        return (
          labels.find((label: Label) => {
            const result = label.id == param
            return result
          })?.name ?? 'unknown'
        )
      }
      return ''
    },
    [labels]
  )

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Filter',
      dataIndex: 'filter',
      key: 'filter',
    },
    {
      title: 'When',
      render: (text: string, row: { eventTypes: RuleEventType[] }) => (
        <>
          {row.eventTypes.map((eventType: RuleEventType, index: number) => {
            return (
              <Tag color={'geekblue'} key={index}>
                {eventType}
              </Tag>
            )
          })}
        </>
      ),
    },
    {
      title: 'Actions',
      render: (text: string, row: { actions: RuleAction[] }) => (
        <>
          {row.actions.map((action: RuleAction, index: number) => {
            const color = action.type.length > 5 ? 'geekblue' : 'green'
            return (
              <Tag color={color} key={index}>
                {action.type}(
                {action.params.map((param: string, index: number) => {
                  const paramString = stringForActionParam(action.type, param)
                  return `"${paramString}${
                    index == action.params.length - 1 ? '"' : '", '
                  }`
                })}
                )
              </Tag>
            )
          })}
        </>
      ),
    },
    {
      title: '',
      key: 'tools',
      render: (_: any, record: { rule: Rule }) => {
        return (
          <Space size="middle">
            <Button
              type="primary"
              onClick={() => {
                setCreateActionRule(record.rule)
              }}
            >
              Add Action
            </Button>
            <Button
              type="default"
              onClick={async () => {
                await deleteRule(record.rule)
              }}
            >
              Delete
            </Button>
          </Space>
        )
      },
    },
  ]

  return (
    <SettingsLayout>
      <Toaster
        containerStyle={{
          top: '5rem',
        }}
      />

      <CreateRuleModal
        revalidate={revalidate}
        isModalOpen={isCreateRuleModalOpen}
        setIsModalOpen={setIsCreateRuleModalOpen}
      />

      <CreateActionModal
        rule={createActionRule}
        setIsModalOpen={(isOpen) => {
          if (!isOpen) {
            setCreateActionRule(undefined)
          }
        }}
        revalidate={revalidate}
      />

      <Box
        css={{ pt: '44px', px: '10%', '@smDown': { px: '0' }, width: '100%' }}
      >
        <HStack css={{ py: '16px' }} distribution="end">
          <Button
            onClick={() => {
              setIsCreateRuleModalOpen(true)
            }}
            type="primary"
          >
            Create a new Rule
          </Button>
        </HStack>

        <Table
          dataSource={dataSource}
          columns={columns}
          // expandable={{ expandedRowRender, indentSize: 30 }}
        />
      </Box>
    </SettingsLayout>
  )
}
