import React, { Component } from 'react';
import { Popover, Layout, Pagination, Table, Button, Icon, Popconfirm, message } from 'antd';
import { Link } from 'react-router-dom';
import $ from '../ajax';
import QRender from 'qrender-react';
import m from 'moment';
import logo from '../T1uklCXhRcXXb1upjX.jpg'
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
        title: '商品信息',
        dataIndex: 'number',
        key: 'number',
        render: (t, d) => {
          return (
            <div style={{ display: 'flex' }}>
              {
                d.thumb && <div>
                  <img style={{ width: 100 }} src={`/uploads/${d.thumb}`} alt="" />
                </div>
              }
              <div style={{ marginLeft: 10 }}>
                <p>商品编号: <Link to={`/index/good/check/${d._id}`}>{d.number}</Link></p>
                <p>商品名称: {d.title}</p>
              </div>
            </div>
          )
        }
      },
      {
        title: '价格(元)',
        dataIndex: 'price',
        render: d => d && d.$numberDecimal
      },
      // {
      //   title: '优惠券号',
      //   dataIndex: 'discount'
      // },
      // {
      //   title: '优惠券领取地址',
      //   render: d => d.discount && <Popover content={<QRender src={logo} text={`http://api.verlantum.cn/card/wx?params=${`${btoa(`good=${d._id}`)}`}`} />} trigger="click">
      //                                   <Button type="link">查看</Button>
      //                                 </Popover>
      // },
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        render: d => m(d).format('YYYY-MM-DD')
      },
      {
        title: '宣传地址',
        dataIndex: 'number',
        render: d => d && <Popover content={<QRender src={logo} text={`http://api.verlantum.cn/good/page/${d}`} />} trigger="click">
                                        <Button type="link">查看</Button>
                                      </Popover>
      },
      {
        title: '操作',
        key: 'id',
        align: 'center',
        render: row => (
          <React.Fragment>
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
    const { history } = this.props;
    return (
      <Layout style={{height: '100%', backgroundColor: '#fff', display: 'flex'}}>
        <Header style={{backgroundColor: '#fff', padding: 10, height: 'auto', lineHeight: 1}}>
          <Button type="primary" onClick={() => history.push('/index/good/create')}><Icon type="plus"/>新增商品</Button>
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
