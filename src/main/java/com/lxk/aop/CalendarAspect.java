package com.lxk.aop;

import com.lxk.annotation.MethodLog;
import com.lxk.httpModel.SessionInfo;
import com.lxk.model.User;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;
import java.lang.reflect.Method;

/**
 * 日历的日志切面操作
 *
 * @author lxk on 2017/12/7
 */
@Component
@Aspect
public class CalendarAspect {

    //声明个切面，切哪呢？切到 com.lxk.service.StudentService 这个目录下，以save开头的方法，方法参数(..)和返回类型(*)不限
    @Pointcut("execution(* com.lxk.service.StudentService.save*(..))")
    private void aa() {
    }//切入点签名

    /**
     * 前置通知
     */
    @Before(value = "@annotation(methodLog)")
    public void beforeMethod(JoinPoint joinPoint, MethodLog methodLog) {
        System.out.println("before method                start ...");
        System.out.println("before method description：" + methodLog.description() + " clazz：" + methodLog.clazz());
        System.out.println("before method                end ...");
    }

    /**
     * 环绕通知 around advice
     * 这个切的是 com.lxk.service 包下面以及子包下所有，后面又 && 同时满足带有注解 MethodLog
     */
    @Around(value = "@annotation(methodLog)")
    public Object methodAround(ProceedingJoinPoint joinPoint, MethodLog methodLog) throws Throwable {
        System.out.println("Around method                start.......................");
        User user = getUserFromSession();
        if (user != null) {
            System.out.println("Around method                " + user.toString());
        }
        //获得自定义注解的参数
        System.out.println("Around method                methodLog 的参数，remark：" + methodLog.description() + " clazz：" + methodLog.clazz());
        //执行目标方法，并获得对应方法的返回值
        Object result = joinPoint.proceed();
        System.out.println("Around method                返回结果：" + result);
        System.out.println("Around method                end.......................");
        return result;
    }

    /**
     * 最终通知 after advice
     * 使用的是在上面声明的切面，并且带上个注解，意思是除了满足上面aa()方法的条件还得带上注解才OK
     */
    @After(value = "@annotation(methodLog)")
    public void methodAfter(JoinPoint joinPoint, MethodLog methodLog) throws Throwable {
        System.out.println("After method                start.......................");
        //获得自定义注解的参数
        System.out.println("After method                methodLog 的参数，remark：" + methodLog.description() + " clazz：" + methodLog.clazz());
        MethodLog remark = getMethodRemark(joinPoint);
        System.out.println("After method                end.......................");
    }

    /**
     * 后置通知
     *
     */
    @AfterReturning(value = "@annotation(methodLog)", returning = "result")
    public void methodAfterReturning(JoinPoint joinPoint, MethodLog methodLog, Object result) throws Throwable {
        System.out.println("AfterReturning method               start.......................");
        System.out.println("AfterReturning method               返回的结果：" + result);
        User user = getUserFromSession();
        if (user != null) {
            System.out.println("AfterReturning               " + user.toString());
        }
        System.out.println("AfterReturning method               end.......................");
    }

    /**
     * 从session里面获得user对象
     */
    private User getUserFromSession() {
        //获取到当前线程绑定的请求对象
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
        //已经拿到session,就可以拿到session中保存的用户信息了。
        User user = null;
        try {
            SessionInfo sessionInfo = (SessionInfo) request.getSession().getAttribute("sessionInfo");
            user = sessionInfo.getUser();
        } catch (Exception ignored) {

        }
        return user;
    }

    /**
     * 获取方法的中文备注____用于记录用户的操作日志描述
     */
    private MethodLog getMethodRemark(JoinPoint joinPoint) throws Exception {
        //返回目标对象
        Object target = joinPoint.getTarget();
        String targetName = target.getClass().getName();
        //返回当前连接点签名
        String methodName = joinPoint.getSignature().getName();
        //获得参数列表
        Object[] arguments = joinPoint.getArgs();

        Class targetClass = Class.forName(targetName);
        Method[] method = targetClass.getMethods();
        //这个怎么这么low呢。
        for (Method m : method) {
            if (m.getName().equals(methodName)) {
                Class[] tmpCs = m.getParameterTypes();
                if (tmpCs.length == arguments.length) {
                    MethodLog methodCache = m.getAnnotation(MethodLog.class);
                    if (methodCache != null && !("").equals(methodCache.description())) {
                        return methodCache;
                    }
                    break;
                }
            }
        }
        return null;
    }
}
