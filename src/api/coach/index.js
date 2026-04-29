import request from '@/utils/request'

// 教练工作台
export function coachDashboard() {
    return request({
        url: '/coach/dashboard',
        method: 'get'
    })
}

// 我的资料
export function coachProfile() {
    return request({
        url: '/coach/profile',
        method: 'get'
    })
}
export function updateCoachProfile(data) {
    return request({
        url: '/coach/profile',
        method: 'put',
        data
    })
}

// 我的排班
export function coachSchedule(query) {
    return request({
        url: '/coach/schedule',
        method: 'get',
        params: query
    })
}

// 我的课程
export function coachCourse(query) {
    return request({
        url: '/coach/course',
        method: 'get',
        params: query
    })
}

// 我的学员预约
export function coachReservation(query) {
    return request({
        url: '/coach/reservation',
        method: 'get',
        params: query
    })
}

// 学员签到
export function coachSign(resId) {
    return request({
        url: '/coach/sign/' + resId,
        method: 'put'
    })
}

// 我的评价
export function coachEvaluation(query) {
    return request({
        url: '/coach/evaluation',
        method: 'get',
        params: query
    })
}