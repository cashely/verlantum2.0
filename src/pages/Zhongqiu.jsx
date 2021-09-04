import React from 'react';
import { Form, Layout, Pagination, Table, Tag, Modal, Button, Input, Upload, Popconfirm, message } from 'antd';
import $ from '../ajax';
import m from 'moment';
import { useState } from 'react';
import { useEffect } from 'react';

export default function Zhongqiu() {
  const [list, setList] = useState([]);
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState({
    page: 1,
    limit: 20,
  });
  


  useEffect(() => {
    countAction();
    listAction();
  }, [query.page])

  const changePage = (page) => {
    setQuery(d => ({ ...d, page }))
  }
  const listAction = () => {
    $.get('/zhongqiu/list', { page: query.page, limit: query.limit }).then(res => {
      if (res.code === 0) {
        setList(res.data)
      }
    })
  }
  const countAction = () => {
    $.get('/zhongqiu/count').then(res => {
      if (res.code === 0) {
        setCount(res.data)
      }
    })
  }

  const sendAction = (id) => {
    $.put(`/zhongqiu/${id}`, { isSend: true }).then(res => {
      if (res.data.code === 0) {
        message.success('操作成功');
        listAction();
      }
    })
  }
  const { Content, Footer, Header } = Layout;
    const columns = [
      {
        title: '姓名',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '联系方式',
        dataIndex: 'phone',
        key: 'phone'
      },
      {
        title: '联系地址',
        dataIndex: 'address',
        key: 'address'
      },
      {
        title: '券号',
        dataIndex: 'card',
        key: 'card'
      },
      {
        title: '规格',
        dataIndex: 'spec',
        key: 'spec'
      },
      {
        title: '是否发货',
        dataIndex: 'isSend',
        render: d => d ? <Tag color="green">已发货</Tag> : <Tag color="red">未发货</Tag>
      },
      {
        title: '领券时间',
        dataIndex: 'createdAt',
        render: d => m(d).format('YYYY-MM-DD HH:mm:ss')
      },
      {
        title: '操作',
        render: d => !d.isSend && <Button onClick={() => sendAction(d._id)} size="small" type="primary">发货</Button>
      }
    ];
    return (
      <Layout style={{height: '100%', backgroundColor: '#fff', display: 'flex'}}>
        <Header style={{backgroundColor: '#fff', padding: 10, height: 'auto', lineHeight: 1}}>
          <Form layout="inline">
            <Form.Item>
              <Button type="primary" onClick={() => setVisible(true)}>录入券号</Button>
            </Form.Item>
          </Form>
        </Header>
        <Content style={{overflow: 'auto'}}>
          <CardModel visible={visible} onClose={() => setVisible(false)}/>
          <Table rowKey="_id" onRow={r => {return {onClick: e => {} }}} columns={columns} dataSource={list} size="middle" bordered pagination={false}/>
        </Content>
        <Footer style={{padding: 5, backgroundColor: '#fff'}}>
          <Pagination defaultCurrent={1} total={count} pageSize={query.limit} onChange={changePage} />
        </Footer>
      </Layout>
    )
}


function CardModel(props) {
  const { visible, onClose } = props;
  const [number, setCard] = useState('');
  const createCard = () => {
    $.post('/zhongqiu/card', { number }).then(res => {
      if (res.data.code === 0) {
        message.success('操作成功');
        onClose();
      } else {
        message.error(res.data.msg);
      }
    })
  }
  useEffect(() => {
    setCard('');
  }, [visible]);
  const { Item } = Form;
  return (
    <Modal
      title="系统变量"
      visible={visible}
      onOk={createCard}
      onCancel={onClose}
    >
      <Form layout="horizontal" labelCol={{span: 6}} wrapperCol={{span: 18}}>
        <Item label="变量名称">
          <Input value={number} onChange={(e) => setCard(e.currentTarget.value)} />
        </Item>
      </Form>
    </Modal>
  )
}
