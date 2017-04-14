package com.lxk.httpModel;

import com.lxk.model.User;

/**
 * web 会话信息
 * <p>
 * Created by lxk on 2017/4/13
 */
public class SessionInfo {

    /**
     * 用户
     */
    private User user;

    public SessionInfo() {
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

}
