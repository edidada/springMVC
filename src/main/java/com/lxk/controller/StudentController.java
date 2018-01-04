package com.lxk.controller;

import com.google.common.base.Strings;
import com.lxk.httpModel.JsonResult;
import com.lxk.model.Student;
import com.lxk.service.StudentService;
import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiImplicitParams;
import io.swagger.annotations.ApiOperation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.net.MalformedURLException;
import java.util.List;

/**
 * Created by lxk on 2017/3/27
 */
@Controller
@RequestMapping("student")
public class StudentController {

    private static final Logger LOG = LoggerFactory.getLogger(StudentController.class);

    @Resource(name = "studentService")
    private StudentService studentService;

    @Value("${notShowStreamOperateLog:false}")
    private Boolean notShowStreamOperateLog;

    @Value("${selfPort:100}")
    private String selfPort;

    @ApiOperation(value = "获取用户列表", notes = "返回mav，也就是个简单的列表页面。")
    @RequestMapping(value = "", method = RequestMethod.GET)
    public ModelAndView init(HttpServletRequest request) throws MalformedURLException {

        ModelAndView mav = new ModelAndView();
        mav.setViewName("studentDisplay");
        List<Student> all = studentService.getAllStudent();
        mav.addObject("students", all);
        System.out.println("getProperty(\"user.dir\") " + System.getProperty("user.dir"));
        System.out.println("getServletContext");
        System.out.println("getRealPath " + request.getSession().getServletContext().getRealPath("/"));
        System.out.println("getContextPath " + request.getSession().getServletContext().getContextPath());
        System.out.println("getResourcePaths " + request.getSession().getServletContext().getResourcePaths("/"));
        System.out.println("getResourcePaths " + request.getSession().getServletContext().getResourceAsStream("/WEB-INF/classes/error.xml"));
        return mav;
    }

    @ApiOperation(value = "获得所有的学生对象list", notes = "get请求，查询所有的学生。")
    @RequestMapping(value = "/getAllStudent", method = RequestMethod.GET)
    public ModelAndView getAllStudent() {
        LOG.debug(selfPort);
        LOG.debug(notShowStreamOperateLog + "");

        ModelAndView mav = new ModelAndView();
        mav.setViewName("studentDisplay");
        List<Student> all = studentService.getAllStudent();
        mav.addObject("students", all);
        return mav;
    }

    @ApiOperation(value = "根据学生的name，获得单个学生的信息", notes = "根据学生的name，查询学生对象的信息。")
    @ApiImplicitParam(name = "name", value = "学生的名称", required = true, dataType = "String")
    @ResponseBody
    @RequestMapping(value = "getStudentByName", method = RequestMethod.POST)
    public JsonResult getStudentByName(String name) {
        if (Strings.isNullOrEmpty(name)) {
            return new JsonResult(false, "name is null");
        }
        List<Student> result = studentService.findStudetByName(name);
        return result.isEmpty()
                ? new JsonResult(false, "查无结果")
                : new JsonResult(true, "查找成功", result);
    }


    @ApiOperation(value = "根据学生的name和age，获得单个学生的信息", notes = "根据学生的name和age，查询学生对象的信息。")
    @ApiImplicitParams({@ApiImplicitParam(name = "name", value = "学生名称", required = true, dataType = "String"),
            @ApiImplicitParam(name = "age", value = "学生年龄", required = true, dataType = "int")})
    @ResponseBody
    @RequestMapping(value = "getStudentByNameAndAge", method = RequestMethod.POST)
    public JsonResult getStudentByName(String name, int age) {
        if (Strings.isNullOrEmpty(name)) {
            return new JsonResult(false, "name is null");
        }

        List<Student> result = studentService.findStudetByNameAndAge(name, age);
        return result.isEmpty()
                ? new JsonResult(false, "查无结果")
                : new JsonResult(true, "查找成功", result);
    }

    @ApiOperation(value = "新建学生对象到数据库", notes = "新建数据到数据库。")
    @ApiImplicitParam(name = "student", value = "学生对象", required = true, dataType = "Student")
    @ResponseBody
    @RequestMapping(value = "createNewStudent", method = RequestMethod.POST)
    public JsonResult create(@RequestBody Student student) {
        if (student == null) {
            return new JsonResult(false, "student is null");
        }
        Student result = studentService.save(student);
        //Student result = studentService.saveEmptyData(student);
        return result == null
                ? new JsonResult(false, "查无结果")
                : new JsonResult(true, "查找成功", result);
    }
}
