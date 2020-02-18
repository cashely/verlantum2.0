import React, { Component } from 'react';
import { DatePicker, Layout, Pagination, Table, Tag, Progress, Button, Icon, Upload, Form } from 'antd';
import $ from '../ajax';
import m from 'moment';
import _ from 'lodash';
import OuterModal from '../components/models/OuterModal';

export default class Outer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      apis: [],
      visible: {
        outer: false
      },
    }
  }

  listAction() {
    $.get('/apis').then(res => {
      if(res.code === 0) {
        this.setState({
          apis: res.data
        })
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
        render: (t, d, index) => index + 1
      },
      {
        title: '接口地址',
        dataIndex: 'uri'
      },
      {
        title: 'Method',
        dataIndex: 'method',
        render: d => <Tag>{d.toUpperCase()}</Tag>
      },
      {
        title: '描述',
        dataIndex: 'mark',
      }
    ];
    return (
      <Layout style={{height: '100%', backgroundColor: '#fff', display: 'flex'}}>
        <Content style={{overflow: 'auto'}}>
          <Table columns={columns} dataSource={this.state.apis} size="middle" bordered pagination={false}/>
        </Content>
      </Layout>
    )
  }
}
