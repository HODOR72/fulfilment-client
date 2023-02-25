export interface ICompletedLessons {
	lesson_schedule_id: number
	user_id: string
}

export interface ILessons {
	id: number
	name: string
	image: string
	link: string
}

export interface ILessonsInCourses {
	id: number
	lesson_id: number
	course_id: number
}

export interface ISortedLessonsInCourses {
	id: number
	lesson_id: number
	course_id: number
	day: IDays
	lesson: ILessons
}
export interface ICourses {
	id: number
	name: string
	image: string
	description: string
}
export interface IWeeks {
	id: number
	name: string
}

export interface IDays {
	id: number
	name: string
}
