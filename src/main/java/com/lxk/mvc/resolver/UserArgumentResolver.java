package com.lxk.mvc.resolver;

import com.lxk.httpModel.SessionInfo;
import org.springframework.core.MethodParameter;
import org.springframework.web.bind.support.WebArgumentResolver;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.context.request.RequestAttributes;

/**
 * 用户逻辑分析器
 * @author User
 *
 */
public class UserArgumentResolver implements WebArgumentResolver {

	/**
	 * controller method 逻辑分析.
	 * 用于注入参数 {@link com.lxk.httpModel.SessionInfo}
	 * @param methodParameter 方法参数
	 * @param nativeWebRequest web请求
	 */
	@Override
	public Object resolveArgument(MethodParameter methodParameter, NativeWebRequest nativeWebRequest) throws Exception {
		if (methodParameter.getParameterType().equals(SessionInfo.class)) {
			return nativeWebRequest.getAttribute("sessionInfo", RequestAttributes.SCOPE_SESSION);
		}
		return UNRESOLVED;
	}

}
