import React, { Component } from 'react';
import { DatePicker, Layout, Pagination, message, Table, Tag, Progress, Button, Icon, Upload, Form } from 'antd';
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
        inner: false
      },
      conditions: {
        date: []
      }
    }
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

  componentWillMount() {
    this.listAction();
  }
  render() {
    const {Content, Footer, Header} = Layout;
    const columns = [
      {
        title: '序号',
        render: (t, d, index) => index + 1
      },
      {
        title: '商品名称',
        dataIndex: 'good',
      },
      {
        title: '订单号',
        dataIndex: 'orderNo'
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
        title: '代理商',
        render: d => d.agent ? d.agent.title : '——',
      },
      {
        title: '分成比例(%)',
        render: d => d.agent ? d.agent.title : '——',
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
        render: row => (
          <React.Fragment>
            {
                row.hasPayed === 0 && <Button type="primary" onClick={this.payAction.bind(this, row._id)} size="small" title="手动付款" ><Icon type="money-collect"/></Button>
            }
            <Button style={{marginLeft: 10}} type="primary" onClick={(e) => {e.stopPropagation(); this.openModelAction('inner',row._id)}} size="small"><Icon type="edit"/></Button>
            <Button style={{marginLeft: 10}} type="danger" size="small" title="删除" ><Icon type="delete"/></Button>
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
            <Form.Item label="时间">
              <DatePicker.RangePicker format="YYYY-MM-DD" value={this.state.conditions.date} onChange={e => this.conditionsChangeAction(e, 'date', 'DATE')} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" onClick={this.searchAction.bind(this)}>搜索</Button>
            </Form.Item>
          </Form>
        </Header>
        <Content style={{overflow: 'auto'}}>
          <Table rowKey="_id" onRow={r => {return {onClick: e => {} }}} columns={columns} dataSource={this.state.inners} size="middle" bordered pagination={false}/>
          {
            this.state.visible.inner && <InnerModal id={this.state.id} visible={this.state.visible.inner} onOk={this.okInnerModalAction.bind(this)} onCancel={this.cancelModelAction.bind(this, 'inner')}/>
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
