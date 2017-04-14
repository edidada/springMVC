package com.lxk.httpModel;

import java.io.Serializable;

/**
 * 通用 web json 对象规范
 */
public class JsonResult implements Serializable {

    private static final long serialVersionUID = 1L;
    /**
     * 成功状态
     */
    private boolean success = false;
    /**
     * 文本信息
     */
    private String msg = "";
    /**
     * 数据
     */
    private Object obj = null;


    public JsonResult() {
    }

    public JsonResult(boolean success) {
        this.success = success;
    }

    public JsonResult(boolean success, String msg) {
        this.success = success;
        this.msg = msg;
    }

    public JsonResult(boolean success, String msg, Object obj) {
        this.setSuccess(success);
        this.setMsg(msg);
        this.setObj(obj);
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

    public Object getObj() {
        return obj;
    }

    public void setObj(Object obj) {
        this.obj = obj;
    }

}
