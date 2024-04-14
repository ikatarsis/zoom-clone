'use server';
import { StreamClient } from '@stream-io/node-sdk';

import {currentUser} from "@clerk/nextjs/server";
import StreamClientProvider from "@/providers/StreamClientProvider";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY
const apiSecret = process.env.STREAM_SECRET_KEY

export const tokenProvider = async () => {
	const user = await currentUser()

	if(!user) throw new Error('Пользователь не авторизирован')
	if(!apiKey) throw new Error('Нет API ключа')
	if(!apiSecret) throw new Error('Нет API Secret')

	const client = new StreamClient(apiKey, apiSecret)

	// сколько валиден токен (by default the token is valid for an hour)
	const exp = Math.round(new Date().getTime() / 1000) + 60 * 60;
	// когда выпущен токен
	const issued = Math.floor(Date.now() / 1000) - 60
	// создаем новый токен по истечению прошлого
	const token = client.createToken(user.id, exp, issued)

	return token
}
