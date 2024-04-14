'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import HomeCard from '@/components/HomeCard'
import { useRouter } from 'next/navigation'
import MeetingModal from '@/components/MeetingModal'
import { useUser } from '@clerk/nextjs'
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk'
import { almostWhole } from 'chart.js/helpers';
import { useToast } from '@/components/ui/use-toast'
import { Textarea } from '@/components/ui/textarea'
import ReactDatePicker, {registerLocale} from 'react-datepicker'
import { Input } from '@/components/ui/input'
import { ru } from 'date-fns/locale/ru';
registerLocale('ru', ru)


const MeetingTypeList = () => {
	const router = useRouter()
	const [meetingState, setMeetingState] =
		useState <'isSheduleMeeting' | 'isJoingMeeting' | 'isInstantMeeting' | undefined>()
	const { user } = useUser()
	const client = useStreamVideoClient()
	const [ values, setValues] = useState({
		dateTime: new Date(),
		description: '',
		link: ''
	})
	const [ callDetails, setCallDetails] = useState<Call>()
	const { toast } = useToast()

	const createMeeting = async () => {
		if(!client || !user) return;

		try {
			if(!values.dateTime){
				toast({ title: 'Выберите дату и время' })
				return;
			}
			const id = crypto.randomUUID()
			const call = client.call('default', id)

			if(!call) throw new Error('Не удалось создать звонок')

			const startsAt = values.dateTime.toISOString() || new Date(Date.now()).toISOString()
			const description = values.description || 'Быстрая встреча'

			await call.getOrCreate({
				data: {
					starts_at: startsAt,
					custom: {
						description
					}
				}
			})
			setCallDetails(call) //после создания вызова, параметры === вызову

			if(!values.description){
				router.push(`/meeting/${call.id}`)
			}

			toast({ title: 'Встреча создана!' })
		} catch (error){
			console.log(error)
			toast({ title: 'Не удалось создать встречу' })
		}
	}

	const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${callDetails?.id}`

	return (
		<section className='grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4'>
			<HomeCard
				img='/icons/add-meeting.svg'
				title='Новая встреча'
				description='Создайте новую встречу'
				handleClick={() => setMeetingState('isInstantMeeting')}
				className='bg-orange-1'
			/>
			<HomeCard
				img='/icons/join-meeting.svg'
				title='Присоединиться'
				description='По ссылке'
				handleClick={() => setMeetingState('isJoingMeeting')}
				className='bg-blue-1'
			/>
			<HomeCard
				img='/icons/schedule.svg'
				title='Запланированные встречи'
				description='Расписание встреч'
				handleClick={() => setMeetingState('isSheduleMeeting')}
				className='bg-purple-1'
			/>
			<HomeCard
				img='/icons/recordings.svg'
				title='Записи встреч'
				description='Просмотре записей'
				handleClick={() => router.push('/recordings')}
				className='bg-yellow-1'
			/>

			{!callDetails ? (
				<MeetingModal
					isOpen={meetingState === 'isSheduleMeeting'}
					onClose={() => setMeetingState(undefined)}
					title='Запланировать встречу'
					handleClick={createMeeting}
				>
					<div className='flex flex-col gap-2.5'>
						<label className='text-base text-normal leading-[22px] text-sky-2'>Добавьте описание</label>
						<Textarea
							className='border-none bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0'
							onChange={(e) => {
								setValues({...values, description: e.target.value})
							}}
						/>
					</div>
					<div className='flex w-full flex-col gap-2.5'>
						<label className='text-base text-normal leading-[22px] text-sky-2'>Выберите дату и время</label>
						<ReactDatePicker
							locale='ru'
							selected={values.dateTime}
							onChange={(date) => setValues({...values, dateTime: date!})}
							showTimeSelect
							timeFormat='HH:mm'
							timeIntervals={15}
							timeCaption='time'
							dateFormat='MMMM d, yyyy h:mm'
							className='w-full rounded bg-dark-3 p-2 focus:outline-none'
						/>
					</div>
				</MeetingModal>
			) : (
				<MeetingModal
					isOpen={meetingState === 'isSheduleMeeting'}
					onClose={() => setMeetingState(undefined)}
					title='Встеча создана'
					className='text-center'
					handleClick={() => {
						navigator.clipboard.writeText(meetingLink)
						toast({ title: 'Ссылка скопирована' })
					}}
					image='/icons/checked.svg'
					buttonIcon='/icons/copy.svg'
					buttonText='Скопировать ссылку'
				/>
			)}

			<MeetingModal
				isOpen={meetingState === 'isInstantMeeting'}
				onClose={() => setMeetingState(undefined)}
				title='Новая встреча'
				className='text-center'
				buttonText='Начать встречу'
				handleClick={createMeeting}
			/>

			<MeetingModal
				isOpen={meetingState === 'isJoingMeeting'}
				onClose={() => setMeetingState(undefined)}
				title='Введите ссылку'
				className='text-center'
				buttonText='Присоединиться'
				handleClick={() => router.push(values.link)}
			>
				<Input
					placeholder='Ссылка на встречу'
					className='border-none bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0'
					onChange={(e) => setValues({...values, link:e.target.value})}
				/>
			</MeetingModal>
		</section>
	);
};

export default MeetingTypeList;
