import React, { useState, useEffect } from 'react';
import { message, Button, Layout } from 'antd';
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
  const [loading, setLoading] = useState(true);
  const { match: { params: { id } }, history } = props; 
  const onOk = () => {
    $.put(`/good/${id}`, good).then(res => {
      if(res.code === 0) {
        message.success('操作成功');
        history.goBack();
      } else {
        message.error('操作失败');
      }
    })
  }
  const detailAction = (i) => {
    $.get(`/good/${i}`).then(res => {
      setLoading(false)
      if(res.code === 0) {
        setGood({...res.data, price: res.data.price.$numberDecimal})
      }
    })
  }
  useEffect(() => {
    detailAction(id)
  }, [id])
  const { Content, Footer } = Layout;
  return (
    <Layout style={{ backgroundColor: '#fff' }}>
      <Content style={{ padding: 10 }}>
        {
          !loading && <GoodDetail good={good} onChange={setGood} onOk={onOk} />
        }
      </Content>
      <Footer>
        <Button type="primary" onClick={onOk}>更新</Button>
      </Footer>
    </Layout>
  )
};
