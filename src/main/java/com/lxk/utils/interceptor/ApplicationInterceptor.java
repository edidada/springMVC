package com.lxk.utils.interceptor;

import com.lxk.httpModel.SessionInfo;
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
        SessionInfo sessionInfo = (SessionInfo) request.getSession().getAttribute("sessionInfo");

        String root = request.getContextPath();//项目名称，根路径
        System.out.println("项目名称，根路径" + root);
        String accessPath = request.getRequestURI();//访问路径
        System.out.println("访问路径" + accessPath);
        String servletPath = request.getServletPath();//相对路径
        System.out.println("相对路径" + servletPath);
        String accessParam = request.getQueryString();//参数
        System.out.println("参数" + accessParam);
        return true;
    }
}