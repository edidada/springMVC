package com.lxk.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;

import java.io.Serializable;
import java.util.Date;

/**
 * 用户
 *
 * @author User
 */
@Document(collection = "users")
public class User implements Serializable {
    /**
     * 最高管理权限用户名
     */
    private static final String SUPREME_AUTHORITY_NAME = "admin";

    private static final long serialVersionUID = 1L;
    @Id
    private String id;
    /**
     * 登陆帐号
     */
    private String login;
    /**
     * 邮箱
     */
    private String email;
    /**
     * 电话
     */
    private String phone;
    /**
     * 名称
     */
    private String name;
    /**
     * 密码
     */
    @Transient
    private String password;
    /**
     * 确认密码
     */
    @Transient
    private String password_confirmation;
    /**
     * 加密密码
     */
    private String crypted_password;
    /**
     *
     */
    private String salt;
    /**
     * cookie值
     */
    private String remember_token;
    /**
     * cookie保存时间
     */
    private Date remember_token_expires_at;
    private int last_version_check;
    private String department;

    /**
     * 操作权限
     */
    private String optRole;

    /**
     * 数据权限
     */
    private String dataRole;

    /**
     * @return 该用户是否有最高权限 true 表示有最高权限
     */
    public static boolean isSupremeAuthorityUser(String login) {
        return SUPREME_AUTHORITY_NAME.equals(login);
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getLogin() {
        return login;
    }

    public void setLogin(String login) {
        this.login = login;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPassword_confirmation() {
        return password_confirmation;
    }

    public void setPassword_confirmation(String password_confirmation) {
        this.password_confirmation = password_confirmation;
    }

    public String getCrypted_password() {
        return crypted_password;
    }

    public void setCrypted_password(String crypted_password) {
        this.crypted_password = crypted_password;
    }

    public String getSalt() {
        return salt;
    }

    public void setSalt(String salt) {
        this.salt = salt;
    }

    public String getRemember_token() {
        return remember_token;
    }

    public void setRemember_token(String remember_token) {
        this.remember_token = remember_token;
    }

    public int getLast_version_check() {
        return last_version_check;
    }

    public void setLast_version_check(int last_version_check) {
        this.last_version_check = last_version_check;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public Date getRemember_token_expires_at() {
        return remember_token_expires_at;
    }

    public void setRemember_token_expires_at(Date remember_token_expires_at) {
        this.remember_token_expires_at = remember_token_expires_at;
    }

    public String getOptRole() {
        return optRole;
    }

    public void setOptRole(String optRole) {
        this.optRole = optRole;
    }

    public String getDataRole() {
        return dataRole;
    }

    public void setDataRole(String dataRole) {
        this.dataRole = dataRole;
    }

}
