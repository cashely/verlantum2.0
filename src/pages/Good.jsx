import React, { Component } from 'react';
import { DatePicker, Layout, Pagination, Table, Tag, Progress, Button, Icon, Upload, Popconfirm, message } from 'antd';
import $ from '../ajax';
import m from 'moment';
import _ from 'lodash';
import GoodModal from '../components/models/GoodModal';

export default class Good extends Component {
  constructor(props) {
    super(props);
    this.state = {
      goods: [],
      total: 0,
      id: null,
      visible: {
        good: false
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

  okGoodModalAction() {
    this.cancelModelAction('good');
    this.listAction();
  }

  listAction() {
    $.get('/good/list').then(res => {
      if(res.code === 0) {
        this.setState({
          goods: res.data
        })
      }
    })
  }

  countAction() {
    $.get('/good/list/count').then(res => {
      if(res.code === 0) {
        this.setState({
          total: res.data
        })
      }
    })
  }

  deleteAction(id) {
    $.delete(`/good/${id}`).then(res => {
      if(res.code === 0) {
        message.success('操作成功');
        this.listAction();
      }
    })
  }

  componentWillMount() {
    this.listAction();
    this.countAction();
  }
  render() {
    const {Content, Footer, Header} = Layout;
    const columns = [
      {
        title: '商品编号',
        dataIndex: 'number',
        key: 'number',
      },
      {
        title: '商品名称',
        dataIndex: 'title',
        key: 'title',
      },
      {
        title: '价格(元)',
        dataIndex: 'price',
        render: d => d && d.$numberDecimal
      },
      {
        title: '优惠券号',
        dataIndex: 'discount'
      },
      {
        title: '优惠券领取地址',
        render: d => d.discount && `http://api.verlantum.cn/card/wx?params=${`${btoa(`good=${d.number}`)}`}`
      },
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        render: d => m(d).format('YYYY-MM-DD')
      },
      {
        title: '宣传地址',
        dataIndex: 'number',
        render: d => d && `http://api.verlantum.cn/good/page/${d}`
      },
      {
        title: '操作',
        key: 'id',
        align: 'center',
        render: row => (
          <React.Fragment>
            <Button type="primary" onClick={() => {}} size="small"><Icon type="qrcode"/></Button>
            <Button type="primary" onClick={(e) => {e.stopPropagation(); this.openModelAction('good', row._id)}} size="small" style={{marginLeft: 10}}><Icon type="edit"/></Button>
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
          <Button type="primary" onClick={this.openModelAction.bind(this, 'good', null)}><Icon type="plus"/>新增商品</Button>
        </Header>
        <Content style={{overflow: 'auto'}}>
          <Table rowKey="_id" onRow={r => {return {onClick: e => {} }}} columns={columns} dataSource={this.state.goods} size="middle" bordered pagination={false}/>
          {
            this.state.visible.good && <GoodModal id={this.state.id} visible={this.state.visible.good} onOk={this.okGoodModalAction.bind(this)} onCancel={this.cancelModelAction.bind(this, 'good')}/>
          }
        </Content>
        <Footer style={{padding: 5, backgroundColor: '#fff'}}>
          <Pagination defaultCurrent={1} total={this.state.total}/>
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
