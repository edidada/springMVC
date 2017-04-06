package com.lxk.controller;

import com.lxk.model.Student;
import com.lxk.service.StudentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
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


    @RequestMapping(value = "/getAllStudent", method = RequestMethod.GET)
    public ModelAndView getAllStudent() {
        LOG.error(selfPort);
        LOG.error(notShowStreamOperateLog + "");

        ModelAndView mav = new ModelAndView();
        mav.setViewName("studentDisplay");
        List<Student> all =  studentService.getAllStudentInMongo();
        mav.addObject("students",all);
        return mav;
    }
}
