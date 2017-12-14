package com.lxk.controller;

import com.google.common.base.Strings;
import com.lxk.httpModel.JsonResult;
import com.lxk.model.Student;
import com.lxk.service.StudentService;
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

    @RequestMapping(value = "", method = RequestMethod.GET)
    public ModelAndView init() {

        ModelAndView mav = new ModelAndView();
        mav.setViewName("studentDisplay");
        List<Student> all = studentService.getAllStudent();
        mav.addObject("students", all);
        return mav;
    }

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
