import React from 'react';
import { Popconfirm, Button, message } from 'antd';
import $ from '../../ajax';

export default function CreateRefund(props) {
  const { _id, callback = () => {} } = props;
  const cancel = () => {};
  const confirm = () => {
    $.post('/refund/create', { orderId: _id }).then(res => {
      if (res.code === 0) {
        message.success('操作成功,请前往退款管理确认!');
        callback();
      } else {
        message.error(res.data.msg);
      }
    })
  };
  return (
    <Popconfirm
      title="确定要人工生成退款单吗?"
      onConfirm={confirm}
      onCancel={cancel}
      okText="是"
      cancelText="否"
    >
      <Button size="small" type="primary" style={{ marginLeft: 10 }}>生成退款</Button>
    </Popconfirm>
  )
}
