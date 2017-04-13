package com.lxk.utils.interceptor;

import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * 拦截器类。
 * 该类负责拦截用户请求
 */
public class ApplicationInterceptor extends HandlerInterceptorAdapter {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String root = request.getContextPath();//项目名称，根路径
        String accessPath = request.getRequestURI();//访问路径
        String servletPath = request.getServletPath();//相对路径
        String accessParam = request.getQueryString();//参数
        System.out.println(root + accessPath + servletPath + accessParam);
        return true;
    }
}