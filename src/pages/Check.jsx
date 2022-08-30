import React, { Component } from 'react';
import { DatePicker, Layout, Pagination, message, Table, Tag, Progress, Button, Icon, Popconfirm, Form } from 'antd';
import $ from '../ajax';
import m from 'moment';
import _ from 'lodash';
import ReportModal from '../components/models/ReportModal';

export default class Inner extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checks: [],
      total: 0,
      page: 1,
      limit: 20,
      id: null,
      visible: {
        reportPath: false,
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

  okReportModalAction() {
    this.cancelModelAction('reportPath');
    this.listAction();
  }

  deleteAction(id) {
    $.delete(`/check/delete/${id}`).then(res => {
      if(res.code === 0) {
        message.success('操作成功');
        this.listAction();
      }
    })
  }

  listAction() {
    $.get('/check/scan', {page: this.state.page, limit: this.state.limit, ...this.state.conditions}).then(res => {
      if(res.code === 0) {
        this.countListAction();
        this.setState({
          checks: res.data
        })
      }
    })
  }

  countListAction() {
    $.get('/check/total', this.state.conditions).then(res => {
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
        fixed: 'left',
        width: 50,
        render: (t, d, index) => index + 1
      },
      {
        title: '检测编号',
        fixed: 'left',
        width: 100,
        dataIndex: 'botNumber',
      },
      {
        title: '检测人',
        dataIndex: 'uname'
      },
      {
        title: 'openid',
        dataIndex: 'openid'
      },
      {
        title: '身份证',
        dataIndex: 'passPortNumber',
      },
      {
        title: '性别',
        dataIndex: 'sex',
        render: d => d === 1 ? '男' : '女'
      },
      {
        title: '年龄',
        dataIndex: 'age',
      },
      {
        title: '采集日期',
        dataIndex: 'checkDate',
        render: d => m(d).format('YYYY-MM-DD HH:mm:ss')
      },
      {
        title: '联系方式',
        dataIndex: 'phone'
      },
      {
        title: '报告',
        render: d => d.reportPath ? <a href={`https://api.verlantum.cn/uploads/${d.reportPath}`} rel="noopener noreferrer" target='_blank'>查看</a> : '暂未上传',
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
        render: row => (
          <React.Fragment>
            <Button style={{marginLeft: 10}} type="primary" onClick={(e) => {e.stopPropagation(); this.openModelAction('reportPath', row._id)}} size="small"><Icon type="file"/>上传报告</Button>
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
            <Form.Item label="时间">
              <DatePicker.RangePicker format="YYYY-MM-DD" value={this.state.conditions.date} onChange={e => this.conditionsChangeAction(e, 'date', 'DATE')} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" onClick={this.searchAction.bind(this)}>搜索</Button>
            </Form.Item>
          </Form>
        </Header>
        <Content style={{overflow: 'auto'}}>
          <Table rowKey="_id" scroll={{ x: true }} onRow={r => {return {onClick: e => {} }}} columns={columns} dataSource={this.state.checks} size="middle" bordered pagination={false}/>
          {
            this.state.visible.reportPath && <ReportModal id={this.state.id} visible={this.state.visible.reportPath} onOk={this.okReportModalAction.bind(this)} onCancel={this.cancelModelAction.bind(this, 'reportPath')} />
          }
        </Content>
        <Footer style={{padding: 5, backgroundColor: '#fff'}}>
          <Pagination defaultCurrent={1} total={this.state.total} pageSize={this.state.limit} current={this.state.page} onChange={this.pageChangeAction.bind(this)}/>
        </Footer>
      </Layout>
    )
  }
}
