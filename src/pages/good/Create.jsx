import React, { useState } from 'react';
import { message, Layout, Button } from 'antd';
import $ from '../../ajax';
import GoodDetail from "./GoodDetail";

export default props => {
  const [good, setGood]= useState({
    title: '',
    price: 0,
    stock: 0,
    discount: '',
    number: '',
    url: '',
    template: '',
    thumb: '',
    html: '',
  });
  const onOk = () => {
    const { history } = props;
    $.post(`/good/create`, good).then(res => {
      if(res.code === 0) {
        message.success('操作成功');
        history.goBack();
      } else {
        message.error('操作失败');
      }
    })
  }
  const { Content, Footer } = Layout
  return (
    <Layout style={{ backgroundColor: '#fff' }}>
      <Content style={{ padding: 10 }}>
        <GoodDetail good={good} onChange={setGood} onOk={onOk} />
      </Content>
      <Footer>
        <Button type="primary" onClick={onOk}>创建商品</Button>
      </Footer>
    </Layout>
  )
};
