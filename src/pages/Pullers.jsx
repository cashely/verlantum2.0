import React, { Component } from 'react';
import { DatePicker, Layout, Pagination, message, Form, Input, Table, Tag, Progress, Button, Icon, Upload, Modal } from 'antd';
import $ from '../ajax';
import m from 'moment';
import _ from 'lodash';
import PullerModal from '../components/models/PullerModal';

export default class Outer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pullers: [],
      total: 0,
      page: 1,
      limit: 20,
      id: null,
      visible: {
        puller: false,
        take: false,
      },
      take: {
        money: 22,
        id: null
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

  openModelAction(modelName, id = null) {
    const visible = _.cloneDeep(this.state.visible);
    visible[modelName] = true;
    this.setState({
      visible,
      id
    })
  }

  okPullerModalAction() {
    this.cancelModelAction('puller');
    this.listAction();
  }

  listAction() {
    $.get('/agents', {page: this.state.page, limit: this.state.limit, ...this.state.conditions}).then(res => {
      if(res.code === 0) {
        this.countListAction();
        this.setState({
          pullers: res.data
        })
      }
    })
  }

  countListAction() {
    $.get('/agents/total', this.state.conditions).then(res => {
      if(res.code === 0) {
        this.setState({
          total: res.data
        })
      }
    })
  }

  takeMoneyChangeAction(value) {
    this.setState({
      take: Object.assign({}, this.state.take, {money: value})
    })
  }
  openMoneyModalAction(id) {
    this.setState({
      visible: Object.assign({}, this.state.visible, {take: true}),
      take: Object.assign({}, this.state.take, {id})
    })
  }

  takeAction() {
    $.post(`/take/${this.state.take.id}`, this.state.take).then(res => {
      if(res.code === 0) {
        this.listAction();
        this.cancelModelAction('take');
        message.success('提现成功');
      }else {
        message.error('提现失败')
      }
    })
  }


  pageChangeAction(page, pageSize) {
    this.setState({
      page
    }, this.listAction);
  }

  makeQrcodeAction(puller) {
    window.open(`http://api.verlantum.cn/qrcode?aid=${puller._id}&ratio=${puller.ratio}&price=${puller.price}&good=MIT基因分析与潜能优势`)
  }

  componentWillMount() {
    this.listAction();
  }
  render() {
    const {Content, Footer, Header} = Layout;
    const state = this.state;
    const openMoneyModalAction = id => {
      Modal.confirm({
        title: '收益提取',
        content: (
          <Form>
            <Form.Item label="提取数量">
              {state.take.money}
              <Input value={state.take.money} onChange={e => this.takeMoneyChangeAction(e.currentTarget.value)} />
            </Form.Item>
          </Form>
        ),
        onOk: () => {
          console.log('ok')
        },
        onCancel: () => {
          console.log('cancel')
        }
      })
    }
    const columns = [
      {
        title: '代理商名称',
        dataIndex: 'title',
      },
      {
        title: '积分',
        dataIndex: 'score.$numberDecimal',
      },
      {
        title: '分成比例',
        dataIndex: 'ratio',
      },
      {
        title: '价格',
        dataIndex: 'price',
      },
      {
        title: '联系人',
        dataIndex: 'contact',
      },
      {
        title: '联系地址',
        dataIndex: 'address',
      },
      {
        title: '联系方式',
        dataIndex: 'tel',
      },
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        render: d => m(d).format('YYYY-MM-DD')
      },
      {
        title: '操作',
        align: 'center',
        render: row => (
          <React.Fragment>
            <Button type="primary" onClick={(e) => {e.stopPropagation(); this.openModelAction('puller', row._id)}} size="small"><Icon type="edit"/></Button>
            {
              // <Button style={{marginLeft: 10}} type="danger" size="small"><Icon type="delete"/></Button>
            }
            <Button type="primary" onClick={this.makeQrcodeAction.bind(this, row)} size="small" style={{marginLeft: 10}}><Icon type="qrcode"/></Button>
            <Button type="primary" onClick={this.openMoneyModalAction.bind(this, row._id)} size="small" style={{marginLeft: 10}}><Icon type="money-collect"/></Button>
          </React.Fragment>
        )
      }
    ];
    return (
      <Layout style={{height: '100%', backgroundColor: '#fff', display: 'flex'}}>
        <Header style={{backgroundColor: '#fff', padding: 10, height: 'auto', lineHeight: 1}}>
          <Button type="primary" onClick={this.openModelAction.bind(this, 'puller', null)}><Icon type="plus"/>新增代理商</Button>
        </Header>
        <Content style={{overflow: 'auto'}}>
          <Table rowKey="_id" onRow={r => {return {onClick: e => {} }}} columns={columns} dataSource={this.state.pullers} size="middle" bordered pagination={false}/>
            {
              this.state.visible.puller && <PullerModal id={this.state.id} visible={this.state.visible.puller} onOk={this.okPullerModalAction.bind(this)} onCancel={this.cancelModelAction.bind(this, 'puller')}/>
            }

            <Modal
              visible={this.state.visible.take}
              title="提取收益"
              onOk={this.takeAction.bind(this)}
              onCancel={this.cancelModelAction.bind(this, 'take')}
            >
              <Form layout="horizontal" labelCol={{span: 4}} wrapperCol={{span: 20}}>
                <Form.Item label="提取数量">
                  <Input value={this.state.take.money} onChange={e => this.takeMoneyChangeAction(e.currentTarget.value)} />
                </Form.Item>
              </Form>
            </Modal>
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
