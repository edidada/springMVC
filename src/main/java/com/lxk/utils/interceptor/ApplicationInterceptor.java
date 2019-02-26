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

        //项目名称，根路径
        String root = request.getContextPath();
        //访问路径
        String accessPath = request.getRequestURI();
        //相对路径
        String servletPath = request.getServletPath();
        //参数
        String accessParam = request.getQueryString();
        //System.out.println("项目名称，根路径" + root + ";访问路径" + accessPath + ";参数" + ";相对路径" + servletPath + accessParam);
        return true;
    }
}