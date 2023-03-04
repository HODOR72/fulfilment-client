import cn from 'clsx'
import Image from 'next/image'
import { Fragment, useEffect, useState } from 'react'

import Layout from '@/components/layout/Layout'
import MaterialIcon from '@/components/ui/MaterialIcon'
import Heading from '@/components/ui/heading/Heading'
import Player from '@/components/ui/player/Player'

import { useAuth } from '@/hooks/useAuth'

import { ISortedLessonsInCourses } from '@/shared/types/request.types'

import styles from './Course.module.scss'
import { useCourse } from './useCourse'

const Course = () => {
  const [isVisiblePlayer, setVisiblePlayer] = useState(false)
  const [activeTabId, setActiveTabId] = useState(0)
  const [activeTabDayId, setActiveTabDayId] = useState(0)
  const [videoLink, setVideoLink] = useState<string | null>(null)

  const handlePlay = (url: string) => {
    setVisiblePlayer(true)
    setVideoLink(url)
  }

  const { course, courseLessons, courseSortedLessons, mutateAsync, completedLessons } = useCourse()

  const { user } = useAuth()

  useEffect(() => {
    if (isVisiblePlayer) {
      document.body.classList.add('lock')
    } else {
      document.body.classList.remove('lock')
    }
  }, [isVisiblePlayer])

  if (!course || !courseLessons || !courseSortedLessons || !courseLessons.length) return null

  const ids = courseSortedLessons[0].flatMap((lessonArray: any) =>
    lessonArray.map((lesson: any) => lesson.id),
  )

  const weekIsCompleted = ids.every((id: number) => completedLessons?.includes(id))

  const handleComplete = async () => {
    if (user) {
      for (let key of courseSortedLessons[activeTabId][activeTabDayId]) {
        await mutateAsync({
          lesson_schedule_id: key.id,
          user_id: user.id,
        })
      }
    }
  }

  let activeId = 0

  return (
    <Layout>
      <Heading title={course.name} />
      <div className={styles.tablist}>
        {courseSortedLessons.map((_: ISortedLessonsInCourses, i: number) => {
          return (
            <div
              key={i}
              onClick={() => setActiveTabId(i)}
              className={i === activeTabId ? styles.activeTab : ''}
            >
              Неделя {i + 1}
            </div>
          )
        })}
      </div>
      <div className={styles.days}>
        {courseSortedLessons[activeTabId]?.map((el: ISortedLessonsInCourses[], i: number) => {
          const lesson = el.map((el) => el.lesson.id)
          const isCompleted = lesson?.some((item) => completedLessons?.includes(item))
          if (isCompleted) {
            activeId = i + 1
          }
          console.log(activeId !== i)
          return (
            <div
              className={cn(styles.day, {
                [styles.activeDay]: i == activeTabDayId,
              })}
              key={i}
              onClick={() => setActiveTabDayId(i)}
            >
              {(activeId !== i || !(activeTabId === 0 ? true : weekIsCompleted)) &&
                (isCompleted ? <MaterialIcon name="MdCheck" /> : <MaterialIcon name="MdLock" />)}
              <span>День {i + 1}</span>
              <p>{el[0].name}</p>
            </div>
          )
        })}
      </div>
      {courseSortedLessons[activeTabId][activeTabDayId]?.map(
        (el: ISortedLessonsInCourses, i: number) => {
          const { lesson } = el
          const isLock = activeTabDayId > activeId

          return (
            <Fragment key={i}>
              {isLock || !(activeTabId === 0 ? true : weekIsCompleted) ? (
                <div className={styles.lessonLock}>
                  <span>Этот день будет доступен, когда ты закончишь текущий</span>
                </div>
              ) : (
                <div className={styles.lesson}>
                  <Image
                    src={lesson?.image}
                    width={200}
                    height={100}
                    priority
                    unoptimized
                    alt="lesson"
                    draggable={false}
                  />
                  <p>{lesson.name}</p>
                  <button onClick={() => handlePlay(lesson.link)}>Смотреть</button>
                </div>
              )}

              {isVisiblePlayer && (
                <div className={styles.video}>
                  <div className={styles.close} onClick={() => setVisiblePlayer(false)}>
                    <MaterialIcon name="MdClose" />
                  </div>
                  <Player url={String(videoLink)} />
                </div>
              )}
            </Fragment>
          )
        },
      )}
      {activeTabDayId <= activeId &&
        (activeTabId === 0 ? true : weekIsCompleted) &&
        (completedLessons?.some((val: number) =>
          courseSortedLessons[activeTabId][activeTabDayId]
            ?.map((val: ISortedLessonsInCourses) => val.id)
            .includes(val),
        ) ? (
          <p className={styles.text}>День завершен</p>
        ) : (
          <button className={styles.btn} onClick={handleComplete}>
            Завершить день
          </button>
        ))}
    </Layout>
  )
}

export default Course
