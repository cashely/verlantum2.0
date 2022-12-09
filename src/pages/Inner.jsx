import React, { Component } from 'react';
import { DatePicker, Layout, Pagination, message, Table, Tag, Select, Button, Icon, Popconfirm, Form } from 'antd';
import $ from '../ajax';
import m from 'moment';
import _ from 'lodash';
import InnerModal from '../components/models/InnerModal';

export default class Inner extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inners: [],
      total: 0,
      page: 1,
      limit: 20,
      id: null,
      visible: {
        inner: false,
      },
      conditions: {
        date: [],
        sended: 2,
        hasPayed: 2
      },
      selectedRowKeys: [],
    }
  }

  onSelectChange(selectedRowKeys) {
    this.setState({
      selectedRowKeys,
    })
  }

  cancelModelAction(modelName) {
    const visible = _.cloneDeep(this.state.visible);
    visible[modelName] = false;
    this.setState({
      visible,
      id: null
    })
  }

  conditionsChangeAction(e, field, type) {
    let value;
    console.log(e)
    switch(type) {
      default: value = e;
    }
    this.setState({
      conditions: Object.assign({}, this.state.conditions, {[field]: value})
    });
  }

  openModelAction(modelName, id = null) {
    const visible = _.cloneDeep(this.state.visible);
    visible[modelName] = true;
    this.setState({
      visible,
      id
    })
  }

  payAction(id) {
    $.put(`/pay/${id}`).then(res => {
      if(res.code === 0) {
        message.success('付款成功');
        this.listAction()
      }else {
        message.error('付款失败')
      }
    })
  }

  okInnerModalAction() {
    this.cancelModelAction('inner');
    this.listAction();
  }

  deleteAction(id) {
    $.delete(`/order/${id}`).then(res => {
      if(res.code === 0) {
        message.success('操作成功');
        this.listAction();
      }
    })
  }

  listAction() {
    $.get('/orders', {page: this.state.page, limit: this.state.limit, ...this.state.conditions}).then(res => {
      if(res.code === 0) {
        this.countListAction();
        this.setState({
          inners: res.data
        })
      }
    })
  }

  countListAction() {
    $.get('/orders/total', this.state.conditions).then(res => {
      if(res.code === 0) {
        this.setState({
          total: res.data
        })
      }
    })
  }

  pageChangeAction(page, pageSize) {
    this.setState({
      page
    }, this.listAction);
  }

  searchAction() {
    this.setState({
      page: 1
    }, this.listAction);
  }

  sendedAction(id) {
    $.put(`/order/${id}`, { sended: 1 }).then(res => {
      if (res.code === 0) {
        message.success('操作成功');
        this.searchAction();
      } else {
        message.error('操作失败');
      }
    })
  }
  exportExcel() {
    const query = Object.entries(this.state.conditions).map(([key, value]) => {
      return `${key}=${JSON.stringify(value)}`
    })
    window.open(`//api.verlantum.cn/excel/order?${query.join('&')}`)
  }

  // 批量发货
  sendedAllAction(id) {
    $.put(`/order/sended/all`, { ids: this.state.selectedRowKeys }).then(res => {
      if (res.code === 0) {
        message.success('操作成功');
        this.searchAction();
        this.setState({
          selectedRowKeys: [],
        })
      } else {
        message.error('操作失败');
      }
    })
  }

  componentWillMount() {
    this.listAction();
  }
  render() {
    const {Content, Footer, Header} = Layout;
    const columns = [
      {
        title: '序号',
        fixed: 'left',
        width: 50,
        render: (t, d, index) => index + 1
      },
      {
        title: '商品名称',
        fixed: 'left',
        width: 100,
        render: row => row.goodNumber ? row.goodNumber.title : row.good
      },
      {
        title: '订单号',
        dataIndex: 'orderNo'
      },
      {
        title: '包装编号',
        dataIndex: 'boxNumber'
      },
      {
        title: '数量',
        dataIndex: 'count',
      },
      {
        title: '单价(元)',
        dataIndex: 'price',
      },
      {
        title: '总计(元)',
        dataIndex: 'paymentAmount',
      },
      {
        title: '已付金额(元)',
        dataIndex: 'payTotal',
      },
      {
        title: '付款方式',
        dataIndex: 'payChannel',
        render: d => {
          let s = '';
          switch (d) {
            case 0:
            s = '线下';break;
            break;
            case 1 :
            s = '微信';break;
            case 2 :
            s = '支付宝';
            break;
          }
          return s;
        }
      },
      {
        title: '付款情况',
        dataIndex: 'hasPayed',
        render: d => {
          let s = '';
          switch(d) {
            case 0:
            s = <Tag color="red">未付款</Tag>;
            break;
            case 1 :
            s = <Tag color="green">已付款</Tag>;
            break;
          }
          return s;
        }
      },
      {
        title: '用户姓名',
        dataIndex: 'username'
      },
      {
        title: '联系方式',
        dataIndex: 'phone'
      },
      {
        title: '联系地址',
        dataIndex: 'address'
      },
      {
        title: '是否发货',
        dataIndex: 'sended',
        render: d => {
          let s = '';
          switch(d) {
            case 0:
            s = <Tag color="red">未发货</Tag>;
            break;
            case 1 :
            s = <Tag color="green">已发货</Tag>;
            break;
            default : s = <Tag color="red">未发货</Tag>;
          }
          return s;
        }
      },
      {
        title: '代理商',
        render: d => d.agent ? d.agent.contact : '——',
      },
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        render: d => m(d).format('YYYY-MM-DD HH:mm:ss')
      },
      {
        title: '操作',
        key: 'id',
        align: 'center',
        fixed: 'right',
        with: 100,
        render: row => (
          <React.Fragment>
            {
              row.sended !== 1 && (
                <Popconfirm title="发货前请仔细核对用户信息" okText="确认" cancelText="取消" onConfirm={() => {this.sendedAction(row._id)}}>
                  <Button type="primary" size="small">发货</Button>
                </Popconfirm>
              )
            }
            {
                row.hasPayed === 0 && <Button type="primary" style={{marginLeft: 10}} onClick={this.payAction.bind(this, row._id)} size="small" title="手动付款" ><Icon type="money-collect"/></Button>
            }
            <Button style={{marginLeft: 10}} type="primary" onClick={(e) => {e.stopPropagation(); this.openModelAction('inner',row._id)}} size="small"><Icon type="edit"/></Button>
            <Popconfirm
              title="您确定要删除?"
              onConfirm={this.deleteAction.bind(this, row._id)}
              okText="是"
              cancelText="否"
            >
              <Button style={{marginLeft: 10}} type="danger" size="small"><Icon type="delete"/></Button>
            </Popconfirm>
          </React.Fragment>
        )
      }
    ];
    return (
      <Layout style={{height: '100%', backgroundColor: '#fff', display: 'flex'}}>
        <Header style={{backgroundColor: '#fff', padding: 10, height: 'auto', lineHeight: 1}}>
          <Form layout="inline">
            <Form.Item>
                <Button type="primary" onClick={this.openModelAction.bind(this, 'inner', null)}><Icon type="download"/>新增订单</Button>
            </Form.Item>
            <Form.Item>
                <Button type="primary" onClick={this.exportExcel.bind(this)}>导出Excel</Button>
            </Form.Item>
            <Form.Item>
                <Button type="primary" disabled={!this.state.selectedRowKeys.length} onClick={this.sendedAllAction.bind(this, 'inner', null)}>批量发货</Button>
            </Form.Item>
            <Form.Item label="时间">
              <DatePicker.RangePicker format="YYYY-MM-DD" value={this.state.conditions.date} onChange={e => this.conditionsChangeAction(e, 'date', 'DATE')} />
            </Form.Item>
            <Form.Item label="发货状态">
              <Select
                value={this.state.conditions.sended}
                style={{ width: 100 }}
                onChange={e => this.conditionsChangeAction(e, 'sended')}
              >
                {
                  [
                    {
                      value: 2,
                      label: '全部'
                    },
                    {
                      value: 0,
                      label: '未发货',
                    },
                    {
                      value: 1,
                      label: '已发货'
                    },
                  ].map(v => (<Select.Option value={v.value}>{v.label}</Select.Option>))
                }
              </Select>
            </Form.Item>
            <Form.Item label="付款状态">
              <Select
                value={this.state.conditions.hasPayed}
                style={{ width: 100 }}
                onChange={e => this.conditionsChangeAction(e, 'hasPayed')}
              >
                {
                  [
                    {
                      value: 2,
                      label: '全部'
                    },
                    {
                      value: 0,
                      label: '未付款',
                    },
                    {
                      value: 1,
                      label: '已付款'
                    },
                  ].map(v => (<Select.Option value={v.value}>{v.label}</Select.Option>))
                }
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" onClick={this.searchAction.bind(this)}>搜索</Button>
            </Form.Item>
          </Form>
        </Header>
        <Content style={{overflow: 'auto'}}>
          <Table
            rowKey="_id"
            scroll={{ x: true }}
            onRow={r => {return {onClick: e => {} }}}
            columns={columns}
            dataSource={this.state.inners}
            size="middle"
            bordered
            pagination={false}
            rowSelection={{
              selectedRowKeys: this.state.selectedRowKeys,
              onChange: this.onSelectChange.bind(this)
            }}
          />
          {
            this.state.visible.inner && <InnerModal id={this.state.id} visible={this.state.visible.inner} onOk={this.okInnerModalAction.bind(this)} onCancel={this.cancelModelAction.bind(this, 'inner')} />
          }
        </Content>
        <Footer style={{padding: 5, backgroundColor: '#fff'}}>
          <Pagination defaultCurrent={1} total={this.state.total} pageSize={this.state.limit} current={this.state.page} onChange={this.pageChangeAction.bind(this)}/>
        </Footer>
      </Layout>
    )
  }
}

let dataSources = []

for(var a = 0; a < 20; a++) {
  dataSources.push({
    id: a,
    title: `测试用例${a+1}`,
    total: 50,
    successed: 20,
    failed: 20,
    undo: 10,
    creater: '张三',
    runtime: '2013-01-01',
    created: '2013-01-02'
  })
}
