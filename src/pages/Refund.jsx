import React, { Component } from 'react';
import { Popover, Layout, Pagination, Table, Button, Form, Icon, DatePicker, Popconfirm, message, Modal } from 'antd';
import { Link } from 'react-router-dom';
import $ from '../ajax';
import m from 'moment';
import _ from 'lodash';

export default class Refund extends Component {
  constructor(props) {
    super(props);
    this.state = {
      refunds: [],
      total: 0,
      id: null,
      page: 1,
      pageSize: 20,
      visible: {
        good: false
      },
      conditions: {
        date: [],
        orderId: '',
        isGet: 2,
        success: 2,
      },
    }
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

  refundAction(id, info, orderInfo) {
    const { hasPayed, sended, refund } = orderInfo;
    if (hasPayed !== 1) {
      message.error('此单未支付，不支持受理跟退款');
      return
    }
    
    if ([3].includes(refund)) {
      message.error('此单已退款，不支持退款');
      return;
    }
    
    const action = (callback = () => {}) => {
      $.put(`/refund/${id}`, info).then(res => {
        if (res.code === 0) {
          message.success('操作成功');
          this.listAction();
          this.countAction();
        } else {
          message.error(res.data);
        }
        callback();
      })
    }
    
    if (sended === 1) {
      const text = (() => {
        switch (true) {
          case info.success === 1 : return '退款';
          case info.isGet === 1 : return '受理';
          default: return '错误操作';
        }
      })()
      Modal.confirm({
        content: <>{`此单已发货，是否确认${text}`}</>,
        onOk: action
      });
      return;
    }
    action();
  }

  listAction() {
    const { page, pageSize } = this.state;
    $.get('/refund/list', { page, pageSize, ...this.state.conditions }).then(res => {
      if(res.code === 0) {
        this.countAction();
        this.setState({
          refunds: res.data,
        })
      }
    })
  }

  countAction() {
    $.get('/refund/count', this.state.conditions).then(res => {
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
  
  exportExcel() {
    const query = Object.entries(this.state.conditions).map(([key, value]) => {
      return `${key}=${JSON.stringify(value)}`
    })
    window.open(`//api.verlantum.cn/refund/excel/refund?${query.join('&')}`)
  }
  
  searchAction() {
    this.setState({
      page: 1
    }, this.listAction);
  }

  componentWillMount() {
    this.listAction();
  }
  render() {
    const {Content, Footer, Header} = Layout;
    const columns = [
      {
        title: '商品名称',
        dataIndex: 'goodNumber',
        render: d => d.title,
      },
      {
        title: '订单信息',
        dataIndex: 'orderId',
        render: d => (
          <>
            <p><span>订单编号:</span>{d._id}</p>
            <p><span>交易号:</span>{d.orderNo}</p>
            <p><span>订单时间:</span>{m(d.createdAt).format('YYYY-MM-DD HH:mm')}</p>
            <p><span>发货状态:</span>{d.sended === 1 ? '已发货' : '未发货'}</p>
            <p><span>付款状态:</span>{d.hasPayed === 1 ? '已付款' : '未付款'}</p>
          </>
        )
      },
      {
        title: '联系人',
        dataIndex: 'orderId',
        render: d => d.username
      },
      {
        title: '联系方式',
        dataIndex: 'orderId',
        render: d => d.phone
      },
      {
        title: '是否退款',
        dataIndex: 'success',
        render: d => d === 1 ? '是' : '否',
      },
      {
        title: '是否受理',
        dataIndex: 'isGet',
        render: d => d === 1 ? '是' : '否',
      },
      {
        title: '申请时间',
        dataIndex: 'createdAt',
        render: d => m(d).format('YYYY-MM-DD hh:mm')
      },
      {
        title: '操作',
        key: 'id',
        align: 'center',
        render: row => (
          <React.Fragment>
            {
              !row.success && (
                <Popconfirm
                  title="您确定要退款?"
                  onConfirm={this.refundAction.bind(this, row._id, { success: 1 }, row.orderId)}
                  okText="是"
                  cancelText="否"
                >
                  <Button type="primary" size="small">退款</Button>
                </Popconfirm>
              )
            }
            {
              !row.isGet && (
                <Popconfirm
                  title="您确定要受理?"
                  onConfirm={this.refundAction.bind(this, row._id, { isGet: 1 }, row.orderId)}
                  okText="是"
                  cancelText="否"
                >
                  <Button type="primary" size="small">受理</Button>
                </Popconfirm>
              )
            }
          </React.Fragment>
        )
      }
    ];
    const { history } = this.props;
    return (
      <Layout style={{height: '100%', backgroundColor: '#fff', display: 'flex'}}>
        <Header style={{backgroundColor: '#fff', padding: 10, height: 'auto', lineHeight: 1}}>
          <Form layout="inline">
            <Form.Item>
                <Button type="primary" onClick={this.exportExcel.bind(this)}>导出Excel</Button>
            </Form.Item>
            <Form.Item label="时间">
              <DatePicker.RangePicker format="YYYY-MM-DD" value={this.state.conditions.date} onChange={e => this.conditionsChangeAction(e, 'date', 'DATE')} />
            </Form.Item>
            <Form.Item label="受理状态">
              <Select
                value={this.state.conditions.isGet}
                style={{ width: 100 }}
                onChange={e => this.conditionsChangeAction(e, 'isGet')}
              >
                {
                  [
                    {
                      value: 2,
                      label: '全部'
                    },
                    {
                      value: 0,
                      label: '未受理',
                    },
                    {
                      value: 1,
                      label: '已受理'
                    },
                  ].map(v => (<Select.Option value={v.value}>{v.label}</Select.Option>))
                }
              </Select>
            </Form.Item>
            <Form.Item label="退款状态">
              <Select
                value={this.state.conditions.success}
                style={{ width: 100 }}
                onChange={e => this.conditionsChangeAction(e, 'success')}
              >
                {
                  [
                    {
                      value: 2,
                      label: '全部'
                    },
                    {
                      value: 0,
                      label: '未退款',
                    },
                    {
                      value: 1,
                      label: '已退款'
                    },
                  ].map(v => (<Select.Option value={v.value}>{v.label}</Select.Option>))
                }
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" onClick={this.searchAction.bind(this)}>搜索</Button>
            </Form.Item>
          </Form>
          {/* <Button type="primary" onClick={() => history.push('/index/good/create')}><Icon type="plus"/>新增商品</Button> */}
        </Header>
        <Content style={{overflow: 'auto'}}>
          <Table rowKey="_id" onRow={r => {return {onClick: e => {} }}} columns={columns} dataSource={this.state.refunds} size="middle" bordered pagination={false}/>
        </Content>
        <Footer style={{padding: 5, backgroundColor: '#fff'}}>
          <Pagination defaultCurrent={1} total={this.state.total} pageSize={this.state.pageSize} current={this.state.page} onChange={this.pageChangeAction.bind(this)}/>
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
