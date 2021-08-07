/**
 * 商品详情页面
 */
import React, { useState } from 'react';
import { Form, Input, Upload, Icon, Button } from 'antd';
import { useEffect } from 'react';
import 'braft-editor/dist/index.css'
import BraftEditor from 'braft-editor'
import { ContentUtils } from 'braft-utils'

export default props => {
  const { onChange, good } = props;
  const [editorState, setEditorState] = useState(BraftEditor.createEditorState(null))
  const setGood = (fieldname, e) => {
    const goodInfo = Object.assign({}, good, {[fieldname]: typeof(e) === 'object' ? e.currentTarget.value : e})
    onChange(goodInfo)
  }
  const [uploading, setUploading] = useState(false);
  const { Item } = Form;
  const changeEditorState = (info) => {
    setEditorState(info);
    // setGood('html', editorState.toHTML());
  }
  useEffect(() => {
    setEditorState(d => ContentUtils.insertHTML(d, good.html));
  }, [good._id])

  useEffect(() => {
    setGood('html', editorState && editorState.toHTML())
  }, [editorState])
  const uploadButton = (
    <div>
      <Icon type={uploading ? 'loading' : 'plus'} />
      <div className="ant-upload-text">上传缩略图</div>
    </div>
  );
  const handleChange = info => {
    if (info.file.status === 'uploading') {
      setUploading(true);
      return;
    }
    if (info.file.status === 'done') {
      setUploading(false);
      setGood('thumb', info.file.response.data.path)
    }
  }
  
  const editorUpload = (info) => {
    if (info.file.status === 'done') {
      setEditorState(d => ContentUtils.insertMedias(d, [{
        type: 'IMAGE',
        url: `/uploads/${info.file.response.data.path}`,
      }]));
    }

  }
  const controls = ['bold', 'italic', 'underline', 'text-color', 'separator', 'link']
  const extendControls = [
    {
      key: 'antd-uploader',
      type: 'component',
      component: (
        <Upload
          name="file"
          showUploadList={false}
          action="/upload"
          onChange={editorUpload}
        >
          <Button type="link" className="control-item button" data-title="插入图片">
            <Icon type="picture" theme="filled" />
          </Button>
        </Upload>
      )
    }
  ]

  return (
    <>
      <Form layout="horizontal" labelCol={{span: 3}} wrapperCol={{span: 10}}>
        <Item label="商品名称">
          <Input value={good.title} onChange={(e) => setGood('title', e)} />
        </Item>
        <Item label="商品编号">
          <Input value={good.number} placeholder="如果不填写系统会自动生成" onChange={(e) => setGood('number', e)} />
        </Item>
        <Item label="价格">
          <Input value={good.price} onChange={(e) => setGood('price', e)}  addonAfter={<span>元</span>}/>
        </Item>
        <Item label="缩略图">
          <Upload
            name="file"
            listType="picture-card"
            className="avatar-uploader"
            showUploadList={false}
            action="/upload"
            onChange={handleChange}
          >
            {
              good.thumb ? <img style={{ width: '100%' }} src={`/uploads/${good.thumb}`} alt="" /> : uploadButton
            }
          </Upload>
        </Item>
        <Item label="模板名称">
          <Input value={good.template} onChange={(e) => setGood('template', e)} />
        </Item>
        <Item label="链接地址">
          <Input value={good.url} onChange={(e) => setGood('url', e)} addonBefore={<span>http://api.verlantum.cn</span>} />
        </Item>
      </Form>
      <div style={{ paddingLeft: 50 }}>
        <BraftEditor
          style={{ border: '1px solid #d9d9d9', width: 700 }}
          value={editorState}
          onChange={changeEditorState}
          controls={controls}
          extendControls={extendControls}
        />
      </div>
    </>
  );
}