import React, {Component} from 'react';
import {Form, Input, Button, Icon, Modal, Select, message, Radio, Upload} from 'antd';
import $ from '../../ajax';
import _ from 'lodash';
export default class GoodModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fields: {
        title: '',
        price: 0,
        stock: 0,
        discount: '',
        number: '',
        url: '',
        template: '',
        thumb: '',
      },
      uploading: false,
    }
  }
  changeAction(fieldname, e) {
    const fields = Object.assign({}, this.state.fields, {[fieldname]: typeof(e) === 'object' ? e.currentTarget.value : e})
    this.setState({
      fields
    })
  }
  okAction() {
    if(this.props.id) {
      $.put(`/good/${this.props.id}`, this.state.fields).then(res => {
        if(res.code === 0) {
          message.success('操作成功');
          this.props.onOk();
        } else {
          message.error('操作失败');
        }
      })
    }else {
      $.post(`/good/create`, this.state.fields).then(res => {
        if(res.code === 0) {
          message.success('操作成功');
          this.props.onOk();
        } else {
          message.error('操作失败');
        }
      })
    }
  }
  detailAction() {
    $.get(`/good/${this.props.id}`).then(res => {
      if(res.code === 0) {
        this.setState({
          fields: {...res.data, price: res.data.price.$numberDecimal}
        })
      }
    })
  }

  handleChange = info => {
    if (info.file.status === 'uploading') {
      this.setState({ loading: true });
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      console.log(info)
      this.setState({
        loading: false,
        fields: { ...this.state.fields, thumb: info.file.response.data.path }
      })
    }
  }

  componentWillMount() {
    this.props.id && this.detailAction();
  }
  render() {
    const {Item} = Form;
    const { fields: { thumb } } = this.state;
    const uploadButton = (
      <div>
        <Icon type={this.state.uploading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    return (
      <Modal
        title="商品信息"
        visible={this.props.visible}
        onOk={this.okAction.bind(this)}
        onCancel={this.props.onCancel}
      >
        <Form layout="horizontal" labelCol={{span: 4}} wrapperCol={{span: 20}}>
          <Item label="商品名称">
            <Input value={this.state.fields.title} onChange={(e) => this.changeAction('title', e)} />
          </Item>
          <Item label="商品编号">
            <Input value={this.state.fields.number} placeholder="如果不填写系统会自动生成" onChange={(e) => this.changeAction('number', e)} />
          </Item>
          <Item label="价格">
            <Input value={this.state.fields.price} onChange={(e) => this.changeAction('price', e)}  addonAfter={<span>元</span>}/>
          </Item>
          <Item label="库存">
            <Input value={this.state.fields.stock} onChange={(e) => this.changeAction('stock', e)} />
          </Item>
          <Item label="缩略图">
            <Upload
              name="file"
              listType="picture-card"
              className="avatar-uploader"
              showUploadList={false}
              action="/upload"
              // beforeUpload={beforeUpload}
              onChange={this.handleChange}
            >
              {
                thumb ? <img style={{ width: '100%' }} src={`/uploads/${thumb}`} alt="" /> : uploadButton
              }
            </Upload>
          </Item>
          {/* <Item label="优惠券号">
            <Input value={this.state.fields.discount} onChange={(e) => this.changeAction('discount', e)} placeholder="请输入微信卡券批次号" />
          </Item> */}
          <Item label="模板名称">
            <Input value={this.state.fields.template} onChange={(e) => this.changeAction('template', e)} />
          </Item>
          <Item label="链接地址">
            <Input value={this.state.fields.url} onChange={(e) => this.changeAction('url', e)} addonBefore={<span>http://api.verlantum.cn</span>} />
          </Item>
        </Form>
      </Modal>
    )
  }
}
