import React, {Component} from 'react';
import {
  DatePicker,
  Layout,
  Pagination,
  Table,
  Tag,
  Progress,
  Button,
  Icon,
  Popconfirm,
  notification,
  Upload,
} from 'antd';
import Node from '../components/Node';
import Case from '../components/Case';
import $ from '../ajax';
import m from 'moment';
import _ from 'lodash';

export default class Home extends Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      caseAble: false,
      nid: null,
      cid: null,
      cases: [],
      total: 0
    }
  }
  onShowAction(cid) {
    this.setState({cid, visible: true})
  }
  showCaseAction(cid) {
    this.setState({cid, caseAble: true})
  }
  onCancelAction() {
    this.setState({visible: false, cid: null});
  }
  caseCancelAction() {
    this.setState({caseAble: false, cid: null});
  }

  updateCaseProcessAction(caseObj, info) {
    if(info.test && !caseObj.develop) {
      notification.error({
        message: '开发人员没有自测，请先完成开发自测'
      });
      return;
    }
    $.put(`/case/${caseObj._id}`, info).then(res => {
      if(res.code === 0) {
        this.casesAction();
      }
    })
  }

  caseOkAction(caseObj) {
    caseObj = _.assign({}, caseObj, {group: this.props.match.params.id});
    const promise = this.state.cid && caseObj._id ? $.put(`/case/${this.state.cid}`, caseObj) : $.post('/case', caseObj);
    promise.then(res => {
      if(res.code === 0) {
        this.caseCancelAction();
        this.casesAction();
      }
    })
  }

  nodeOkAction(nodes) {
    nodes = _.assign({}, nodes, {case: this.state.cid})
    const promise = nodes._id ? $.put(`/node/${nodes._id}`, nodes) : $.post('/node', nodes)
    promise.then(res => {
      if(res.code === 0) {
        this.onCancelAction();
        this.casesAction();
      }
    })
  }
  casesAction() {
    const cases = $.get('/cases', {group: this.props.match.params.id});
    const pages = $.get('/cases/total', {group: this.props.match.params.id});
    Promise.all([cases, pages]).then(([cases, pages]) => {
      if(cases.code === 0 && pages.code === 0) {
        this.setState({
          cases: cases.data,
          total: pages.data
        })
      }
    })

  }
  caseDeleteAction(cid) {
    $.delete(`/case/${cid}`).then(res => {
      if(res.code === 0) {
        this.casesAction();
      }
    })
  }
  componentWillMount() {
    this.casesAction();
  }
  render() {
    const columns = [
      {
        title: '用例名称',
        dataIndex: 'title'
      }, {
        title: '创建人',
        render: row => <span>{row.acount}</span>
      }, {
        title: '更新时间',
        dataIndex: 'updatedAt',
        render: d => m(d).format('YYYY-MM-DD')
      }, {
        title: '状态',
        render: row =>
              row.test && row.develop
                ? <Tag color="green">成功</Tag>
                : <Tag color="red">失败</Tag>
      }, {
        title: '测试员',
        dataIndex: 'tester',
        render: d => d && d.acount
      }, {
        title: '研发人员',
        dataIndex: 'developer',
        render: d => d && d.acount
      }, {
        title: '测试执行',
        align: 'center',
        render: row => (<div style={{
            display: 'flex',
            alignItems: 'center'
          }}>
          {
            row.test
              ? <Tag color="green">已验证</Tag>
              : <Tag color="red">未验证</Tag>
          }
          <Button type="primary" size="small" onClick={this.updateCaseProcessAction.bind(this, row, {test: +!row.test})}><Icon type={row.test ? 'smile' : 'frown'}/></Button>
        </div>)
      }, {
        title: '研发执行',
        render: row => (<div style={{
            display: 'flex',
            alignItems: 'center'
          }}>
          {
            row.develop
              ? <Tag color="green">已验证</Tag>
              : <Tag color="red">未验证</Tag>
          }
          <Button type="primary" size="small" onClick={this.updateCaseProcessAction.bind(this, row, {develop: +!row.develop})}><Icon type={row.develop ? 'smile' : 'frown'}/></Button>
        </div>)
      }, {
        title: '操作',
        key: 'id',
        align: 'center',
        render: row => (<React.Fragment>
          <Button type="primary" size="small" onClick={this.showCaseAction.bind(this, row._id)}><Icon type="edit"/></Button>
          <Button type="primary" style={{marginLeft: 8, marginRight: 8}} size="small" onClick={() => {this.onShowAction(row._id)}}><Icon type="read"/>
            </Button>
          <Popconfirm title="您确定要删除吗？" onConfirm={this.caseDeleteAction.bind(this, row._id)} onCancel={() => {}}>
            <Button type="danger" size="small"><Icon type="delete"/></Button>
          </Popconfirm>
        </React.Fragment>)
      }
    ];
    const {Content, Footer, Header} = Layout;
    return (<Layout style={{
        height: '100%',
        backgroundColor: '#fff',
        display: 'flex'
      }}>
      <Header style={{backgroundColor: '#fff', padding: 10, height: 'auto', lineHeight: 1}}>
        <Button type="primary" onClick={this.showCaseAction.bind(this)}><Icon type="plus"/> 添加用例</Button>
        <Button type="primary" disabled style={{marginLeft: 10, marginRight: 10}}><Icon type="download"/>导出报告</Button>
        <Upload name="file" data={{group: this.props.match.params.id}} action="/upload">
          <Button>
            <Icon type="upload" /> 导入csv
          </Button>
        </Upload>
      </Header>
      <Content style={{
          overflow: 'auto'
        }}>
        <Table rowKey="id" columns={columns} dataSource={this.state.cases} size="middle" bordered pagination={false}/>
        {
          this.state.visible ? <Node cid={this.state.cid} onOk={this.nodeOkAction.bind(this)} visible={this.state.visible} onCancel={this.onCancelAction.bind(this)}/> : null
        }
        {
          this.state.caseAble ? <Case visible={this.state.caseAble} cid={this.state.cid} onOk={this.caseOkAction.bind(this)} onCancel={this.caseCancelAction.bind(this)}/> : null
        }
      </Content>
      <Footer style={{
          padding: 5,
          backgroundColor: '#fff'
        }}>
        <Pagination defaultCurrent={1} total={this.state.total}/>
      </Footer>
    </Layout>)
  }
}

let dataSources = []

for (var a = 0; a < 20; a++) {
  dataSources.push({
    id: a,
    title: `测试用例具体条目${a + 1}`,
    tester: '张三',
    developer: '李四',
    test: 0,
    develop: 1,
    statu: 0,
    creater: '王小二',
    created: '2013-01-02',
    updated: '2013-01-03'
  })
}
