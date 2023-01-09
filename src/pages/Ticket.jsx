import React, { Component } from 'react';
import { Input, Layout, Pagination, Table, Button, Form, DatePicker, message, Tag } from 'antd';
import $ from '../ajax';
import m from 'moment';
import _ from 'lodash';
import { useEffect, useState } from 'react';

export default (props) => {
  const [tickets, setTickets] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [conditions, setConditions] = useState({ date: [], orderNo: '', orderDate: [] });
  const pageSize = 20;
  useEffect(() => {
    listAction();
    countAction();
  }, [])
  
  const conditionsChangeAction = (e, field, type) => {
    let value;
    console.log(e)
    switch(type) {
      default: value = e;
    }
    setConditions(Object.assign({}, conditions, {[field]: value}));
  }

  const listAction = (page) => {
    $.get('/ticket/list', { page, pageSize, ...conditions }).then(res => {
      if(res.code === 0) {
        setTickets(res.data)
      }
    })
  }
  const countAction = () => {
    $.get('/ticket/list/count', conditions).then(res => {
      if(res.code === 0) {
        setCount(res.data)
      }
    })
  }

  const editTicket = (id, info) => {
    $.put(`/ticket/${id}`, info).then(res => {
      if (res.code === 0) {
        message.success('操作成功');
        listAction(page);
      }
    })
  }
  
  const pageChangeAction = (page, pageSize) => {
    setPage(() => {
      listAction(page);
      countAction();
      return page;
    });
  }
  
  const searchAction = () => {
    setPage(() => {
      listAction(1);
      countAction();
      return 1;
    });
  }
  
  const exportExcel = () => {
    const query = Object.entries(conditions).map(([key, value]) => {
      return `${key}=${JSON.stringify(value)}`
    })
    window.open(`//api.verlantum.cn/ticket/excel/ticket?${query.join('&')}`)
  }
  
  const columns = [
    {
      title: '商品名称',
      dataIndex: 'orderId',
      width: 150,
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
          <p><span>发货状态:</span>{d.sended === 1 ? '已发货' : '未发货'}</p>
          <p><span>付款状态:</span>{d.hasPayed === 1 ? '已付款' : '未付款'}</p>
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
      title: '状态',
      render: row => {
        if (row.isOffer) {
          return <Tag color="green" >已开票</Tag>
        } else if (row.status === 1) {
          return <Tag color="red" >已作废</Tag>
        } else {
          return <span>待处理</span>
        }
      },
    },
    {
      title: '操作',
      key: 'id',
      align: 'center',
      render: row => (
        <React.Fragment>
          {
            !row.isOffer && <Button type="primary" onClick={(e) => editTicket(row._id, { isOffer: true }) } size="small" style={{marginLeft: 10}}>开票</Button>
          }
          {
            row.status === 0 && <Button type="danger" onClick={(e) => editTicket(row._id, { status: 1 }) } size="small" style={{marginLeft: 10}}>作废</Button>
          }
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
        <Form layout="inline">
          <Form.Item>
              <Button type="primary" onClick={exportExcel}>导出Excel</Button>
          </Form.Item>
          <Form.Item label="时间">
            <DatePicker.RangePicker format="YYYY-MM-DD" value={conditions.date} onChange={e => conditionsChangeAction(e, 'date', 'DATE')} />
          </Form.Item>
          <Form.Item label="订单时间">
              <DatePicker.RangePicker format="YYYY-MM-DD" value={conditions.orderDate} onChange={e => conditionsChangeAction(e, 'orderDate', 'DATE')} />
          </Form.Item>
          <Form.Item label="订单号">
              <Input value={conditions.orderNo} onChange={e => conditionsChangeAction(e.currentTarget.value, 'orderNo')} />
            </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={searchAction}>搜索</Button>
          </Form.Item>
        </Form>
      </Header>
      <Content style={{overflow: 'auto'}}>
        <Table rowKey="_id" columns={columns} dataSource={tickets} size="middle" bordered pagination={false}/>
      </Content>
      <Footer style={{padding: 5, backgroundColor: '#fff'}}>
        <Pagination defaultCurrent={1} total={count} pageSize={pageSize} current={page} onChange={pageChangeAction} />
      </Footer>
    </Layout>
  )
}
