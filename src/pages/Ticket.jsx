import React, { Component } from 'react';
import { Popover, Layout, Pagination, Table, Button, message } from 'antd';
import $ from '../ajax';
import m from 'moment';
import _ from 'lodash';
import { useEffect, useState } from 'react';

export default (props) => {
  const [tickets, setTickets] = useState([]);
  const [count, setCount] = useState(0);
  useEffect(() => {
    listAction();
    countAction();
  }, [])

  const listAction = () => {
    $.get('/ticket/list').then(res => {
      if(res.code === 0) {
        setTickets(res.data)
      }
    })
  }
  const countAction = () => {
    $.get('/ticket/list/count').then(res => {
      if(res.code === 0) {
        setCount(res.data)
      }
    })
  }

  const editTicket = (id) => {
    $.put(`/ticket/${id}`, { isOffer: true }).then(res => {
      if (res.code === 0) {
        message.success('操作成功');
        listAction();
      }
    })
  }
  const columns = [
    {
      title: '商品名称',
      dataIndex: 'orderId',
      render: (d) => {
        return (
          <div style={{ display: 'flex' }}>
            {d.goodNumber.title}
          </div>
        )
      }
    },
    {
      title: '开票金额',
      dataIndex: 'amount',
      render: d => d / 100
    },
    {
      title: '订单信息',
      dataIndex: 'orderId',
      render: d => (
        <>
          <p><span>订单编号:</span>{d._id}</p>
          <p><span>交易号:</span>{d.orderNo}</p>
          <p><span>订单时间:</span>{m(d.createdAt).format('YYYY-MM-DD HH:mm')}</p>
        </>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      render: d => d === 0 ? '个人' : '机构',
    },
    {
      title: '开票人',
      dataIndex: 'name',
    },
    {
      title: '开票抬头',
      dataIndex: 'head',
    },
    {
      title: '电子邮箱',
      dataIndex: 'email',
    },
    {
      title: '操作',
      key: 'id',
      align: 'center',
      render: row => (
        <React.Fragment>
          <Button type="primary" onClick={(e) => editTicket(row._id) } size="small" style={{marginLeft: 10}}>开票</Button>
          {/* <Popconfirm
            title="您确定要删除?"
            onConfirm={this.deleteAction.bind(this, row._id)}
            okText="是"
            cancelText="否"
          >
            <Button style={{marginLeft: 10}} type="danger" size="small"><Icon type="delete"/></Button>
          </Popconfirm> */}
        </React.Fragment>
      )
    }
  ];
  const { Header, Content, Footer } = Layout;
  return (
    <Layout style={{height: '100%', backgroundColor: '#fff', display: 'flex'}}>
      <Header style={{backgroundColor: '#fff', padding: 10, height: 'auto', lineHeight: 1}}>
      </Header>
      <Content style={{overflow: 'auto'}}>
        <Table rowKey="_id" columns={columns} dataSource={tickets} size="middle" bordered pagination={false}/>
      </Content>
      <Footer style={{padding: 5, backgroundColor: '#fff'}}>
        <Pagination defaultCurrent={1} total={count}/>
      </Footer>
    </Layout>
  )
}
