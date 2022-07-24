import React, {Component} from 'react';
import {Form, Input, Button, Icon, Modal, Select, message, Radio, Upload} from 'antd';
import $ from '../../ajax';
import _ from 'lodash';
export default class ReportModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fields: {
        path: '',
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
      console.log({ reportPath: this.state.fields.path })
      $.put(`/order/${this.props.id}`, { reportPath: this.state.fields.path }).then(res => {
        if(res.code === 0) {
          message.success('操作成功');
          this.props.onOk();
        } else {
          message.error('操作失败');
        }
      })
    }
  }

  handleChange = info => {
    if (info.file.status === 'uploading') {
      this.setState({ loading: true });
      return;
    }
    if (info.file.status === 'done') {
      this.setState({
        loading: false,
        fields: { path: info.file.response.data.path }
      })
    }
  }

  render() {
    const {Item} = Form;
    // const { fields: { path } } = this.state;
    const uploadButton = (
      <Button type="primary">
        <Icon type={this.state.uploading ? 'loading' : 'plus'} />
        选择文件
      </Button>
    );
    return (
      <Modal
        title="上传报告"
        visible={this.props.visible}
        onOk={this.okAction.bind(this)}
        onCancel={this.props.onCancel}
      >
        <Form layout="horizontal" labelCol={{span: 4}} wrapperCol={{span: 20}}>
          <Item label="选择文件">
            <Upload
              name="file"
              // listType="picture-card"
              className="avatar-uploader"
              // showUploadList={false}
              action="/upload"
              // beforeUpload={beforeUpload}
              onChange={this.handleChange}
            >
              {
                uploadButton
              }
            </Upload>
          </Item>
        </Form>
      </Modal>
    )
  }
}
