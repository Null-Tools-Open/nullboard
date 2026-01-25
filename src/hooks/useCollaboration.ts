import { useEffect, useState, useRef, useCallback } from 'react'
import * as Y from 'yjs'
import { CanvasElement } from '@/components/canvas/shared'
import { encryptData, decryptData } from '@/lib/crypto'
import toast from 'react-hot-toast'

const SERVER_URL = process.env.NEXT_PUBLIC_DRAW_SERVER_URL || ''
const INTERNAL_KEY = process.env.NEXT_PUBLIC_DRAW_INTERNAL_KEY || ''

export interface RemoteCursor {
    clientId: string
    x: number
    y: number
    name: string
    color: string
    isHost?: boolean
    isAnonymous?: boolean
    activity?: any
}

export function useCollaboration(
    roomId: string,
    initialElements: CanvasElement[],
    setElements: (elements: CanvasElement[]) => void,
    user: { name: string; color: string; isAnonymous?: boolean },
    isRoomCreator: boolean = false
) {
    const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected')
    const [remoteCursors, setRemoteCursors] = useState<Map<string, RemoteCursor>>(new Map())
    const [isHost, setIsHost] = useState(false)
    const [sessionEnded, setSessionEnded] = useState(false)
    const [connectionFailed, setConnectionFailed] = useState(false)
    const [roomSettings, setRoomSettings] = useState({ guestEditAccess: true })

    const ydocRef = useRef<Y.Doc>(new Y.Doc())
    const wsRef = useRef<WebSocket | null>(null)
    const isSyncedRef = useRef(false)
    const isHostRef = useRef(false)

    useEffect(() => {
        isHostRef.current = isHost
    }, [isHost])

    const isRoomCreatorRef = useRef(isRoomCreator)

    isRoomCreatorRef.current = isRoomCreator

    const elementsRef = useRef(initialElements)
    elementsRef.current = initialElements

    const settingsRef = useRef(roomSettings)
    settingsRef.current = roomSettings

    const sendSnapshot = useCallback(async () => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return

        try {
            const state = Y.encodeStateAsUpdate(ydocRef.current)
            const encryptedState = await encryptData(state)

            const encryptedSettings = await encryptData(settingsRef.current)

            wsRef.current.send(JSON.stringify({
                type: 'snapshot',
                data: encryptedState,
                settings: encryptedSettings
            }))
        } catch (e) {
            console.error('Failed to send snapshot', e)
        }
    }, [])

    const updateRoomSettings = useCallback(async (newSettings: Partial<typeof roomSettings>) => {
        if (!isHost) return

        const updated = { ...roomSettings, ...newSettings }
        setRoomSettings(updated)

        if (wsRef.current?.readyState === WebSocket.OPEN) {
            try {
                const encrypted = await encryptData(updated)
                wsRef.current.send(JSON.stringify({
                    type: 'room_settings',
                    data: encrypted
                }))
            } catch (e) {
                console.error('Failed to send settings update', e)
            }
        }
    }, [roomSettings, isHost])

    const [clientId] = useState(() => {
        if (typeof window === 'undefined') return `client-${Math.random().toString(36).substr(2, 9)}`

        const stored = localStorage.getItem(`collab-client-id-${roomId}`)
        if (stored) return stored

        const newId = `client-${Math.random().toString(36).substr(2, 9)}`
        if (roomId) localStorage.setItem(`collab-client-id-${roomId}`, newId)
        return newId
    })

    useEffect(() => {
        if (!roomId) {
            setIsHost(false)
            setSessionEnded(false)
        } else {
            ydocRef.current = new Y.Doc()
        }
    }, [roomId])

    const stopSession = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'close_room' }))
        }
        toast.success('Session ended', { id: 'collab-status' })
    }, [])

    const leaveRoom = useCallback(() => {
    }, [])

    useEffect(() => {
        setSessionEnded(false)
        setConnectionFailed(false)

        if (!roomId) {
            setStatus('disconnected')
            return
        }

        let ws: WebSocket
        let reconnectTimer: NodeJS.Timeout
        let hasInitialSync = false
        let shouldReconnect = true

        const connect = async () => {
            if (!shouldReconnect) return

            setStatus('connecting')
            toast.loading('Connecting to session...', { id: 'collab-status' })

            ws = new WebSocket(SERVER_URL)
            wsRef.current = ws

            ws.onopen = () => {
                ws.send(JSON.stringify({
                    type: 'auth',
                    key: INTERNAL_KEY
                }))
            }

            const sendSnapshot = async () => {
                if (ws && ws.readyState === WebSocket.OPEN) {
                    const update = Y.encodeStateAsUpdate(ydocRef.current)
                    const encrypted = await encryptData(Array.from(update))
                    const encryptedSettings = await encryptData(settingsRef.current)
                    ws.send(JSON.stringify({ type: 'snapshot', data: encrypted, settings: encryptedSettings }))
                }
            }

            ws.onmessage = async (event) => {
                try {
                    const msg = JSON.parse(event.data)

                    if (msg.type === 'auth' && msg.status === 'ok') {

                        console.log('[COLLAB] Auth OK, isRoomCreatorRef.current =', isRoomCreatorRef.current, 'isRoomCreator param =', isRoomCreator)
                        const messageType = isRoomCreatorRef.current ? 'create' : 'join'
                        console.log('[COLLAB] Sending message type:', messageType)
                        ws.send(JSON.stringify({ type: messageType, roomId, clientId }))

                    } else if (msg.type === 'joined') {

                        setStatus('connected')
                        toast.success('Connected to session', { id: 'collab-status' })

                        setIsHost(msg.isHost === true)

                        const initialCursor = {
                            clientId,
                            x: 0,
                            y: 0,
                            name: user.name,
                            color: user.color,
                            isHost: msg.isHost === true,
                            isAnonymous: user.isAnonymous
                        }
                        try {
                            const encrypted = await encryptData({ clientId, cursor: initialCursor })
                            ws.send(JSON.stringify({ type: 'awareness', clientId, data: encrypted }))
                        } catch (e) {
                            console.error('Failed to send initial awareness', e)
                        }

                        if (msg.isHost) {

                            const yElements = ydocRef.current.getArray('elements')

                            const currentElements = elementsRef.current

                            if (currentElements.length > 0 && yElements.length === 0) {
                                ydocRef.current.transact(() => {
                                    yElements.push(currentElements)
                                })
                                setTimeout(() => sendSnapshot(), 100)
                            } else {
                            }
                        } else {
                            if (!hasInitialSync) {
                                setElements([])
                            }
                        }

                    } else if (msg.type === 'room_closed') {
                        setStatus('disconnected')
                        setRemoteCursors(new Map())

                        if (msg.reason === 'server_shutdown') {
                            toast.error('Connection lost: Server is restarting', { id: 'collab-status', duration: 5000 })
                        } else {
                            toast('Host ended the session', { id: 'collab-status' })
                        }

                        setSessionEnded(true)

                        shouldReconnect = false
                        ws.close()

                    } else if (msg.type === 'error' && msg.message === 'Room not found') {
                        setStatus('disconnected')
                        setConnectionFailed(true)
                        toast.error('Room not found. The session may have ended or does not exist.', { id: 'collab-status' })
                        shouldReconnect = false
                        ws.close()

                    } else if (msg.type === 'snapshot' && msg.data && !hasInitialSync) {
                        hasInitialSync = true
                        try {
                            const decrypted = await decryptData(msg.data)
                            const update = new Uint8Array(decrypted)
                            Y.applyUpdate(ydocRef.current, update)

                            if (msg.settings) {
                                const decryptedSettings = await decryptData(msg.settings)
                                if (decryptedSettings) {
                                    setRoomSettings(decryptedSettings)
                                }
                            }
                        } catch (e) {
                            console.error('Failed to decrypt snapshot', e)
                        }

                    } else if (msg.type === 'room_settings') {
                        try {
                            const decryptedSettings = await decryptData(msg.data)
                            if (decryptedSettings) {
                                setRoomSettings(decryptedSettings)
                                toast.success(decryptedSettings.guestEditAccess ? 'Guest access enabled' : 'Guest access disabled')
                            }
                        } catch (e) {
                            console.error('Failed to decrypt room settings', e)
                        }

                    } else if (msg.type === 'update') {
                        try {
                            const decrypted = await decryptData(msg.data)
                            const update = new Uint8Array(decrypted)
                            Y.applyUpdate(ydocRef.current, update)
                        } catch (e) {
                            console.error('Failed to decrypt update', e)
                        }

                    } else if (msg.type === 'peer-left') {
                        if (msg.clientId) {
                            setRemoteCursors(prev => {
                                const next = new Map(prev)
                                next.delete(msg.clientId)
                                return next
                            })
                        }

                    } else if (msg.type === 'awareness') {
                        try {
                            const awarenessData = await decryptData(msg.data)
                            const { clientId: remoteClientId, cursor } = awarenessData
                            if (remoteClientId !== clientId && cursor) {
                                setRemoteCursors(prev => {
                                    const next = new Map(prev)
                                    next.set(remoteClientId, cursor)
                                    return next
                                })
                            }
                        } catch (e) {
                            console.error('Failed to decrypt awareness', e)
                        }

                    } else if (msg.type === 'request_snapshot') {

                        if (isHostRef.current) {
                            sendSnapshot()
                        }
                    }
                } catch (e) {
                    console.error('WS Message error', e)
                }
            }

            ws.onclose = () => {
                setStatus('disconnected')
                setRemoteCursors(new Map())

                if (shouldReconnect) {
                    toast.loading('Reconnecting...', { id: 'collab-status' })
                    reconnectTimer = setTimeout(connect, 3000)
                }
            }
        }

        connect()

        return () => {
            shouldReconnect = false
            ws?.close()
            clearTimeout(reconnectTimer)
        }
    }, [roomId])

    useEffect(() => {
        if (!roomId) return

        const yElements = ydocRef.current.getArray('elements')

        const observer = () => {
            const yData = yElements.toArray() as CanvasElement[]

            const uniqueYData = Array.from(new Map(yData.map(item => [item.id, item])).values())

            isSyncedRef.current = true
            setElements(uniqueYData)
            setTimeout(() => {
                isSyncedRef.current = false
            }, 0)
        }

        yElements.observe(observer)

        return () => {
            yElements.unobserve(observer)
        }
    }, [setElements, roomId])

    useEffect(() => {
        if (!roomId) return

        const doc = ydocRef.current

        const sendSnapshot = async () => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                const update = Y.encodeStateAsUpdate(ydocRef.current)
                const encrypted = await encryptData(Array.from(update))
                wsRef.current.send(JSON.stringify({ type: 'snapshot', data: encrypted }))
            }
        }

        const handleUpdate = async (update: Uint8Array) => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                const updateArray = Array.from(update)
                const encrypted = await encryptData(updateArray)

                wsRef.current.send(JSON.stringify({
                    type: 'update',
                    data: encrypted
                }))
            } else {
                console.warn('[COLLAB] Cannot send update - WS not open', wsRef.current?.readyState)
            }
        }

        doc.on('update', handleUpdate)

        const snapshotInterval = setInterval(() => {
            if (isHostRef.current) {
                sendSnapshot()
            }
        }, 5000)

        return () => {
            doc.off('update', handleUpdate)
            clearInterval(snapshotInterval)
        }
    }, [roomId, isHost])

    const setElementsYjs = useCallback((newElements: CanvasElement[] | ((prev: CanvasElement[]) => CanvasElement[])) => {
        if (isSyncedRef.current) return

        const doc = ydocRef.current
        const yArray = doc.getArray('elements')
        const currentYElems = yArray.toArray() as CanvasElement[]

        const elements = typeof newElements === 'function'
            ? newElements(currentYElems)
            : newElements

        const uniqueElements = Array.from(new Map(elements.map(item => [item.id, item])).values())

        doc.transact(() => {
            let yIndex = 0
            for (let i = 0; i < uniqueElements.length; i++) {
                const targetEl = uniqueElements[i]

                if (yIndex >= yArray.length) {
                    yArray.push([targetEl])
                    yIndex++
                    continue
                }

                const currentEl = yArray.get(yIndex) as CanvasElement

                if (currentEl.id === targetEl.id) {
                    if (JSON.stringify(currentEl) !== JSON.stringify(targetEl)) {
                        yArray.delete(yIndex, 1)
                        yArray.insert(yIndex, [targetEl])
                    }
                    yIndex++
                } else {
                    let foundLaterIndex = -1
                    for (let j = yIndex + 1; j < Math.min(yIndex + 50, yArray.length); j++) {
                        const scanEl = yArray.get(j) as CanvasElement
                        if (scanEl.id === targetEl.id) {
                            foundLaterIndex = j
                            break
                        }
                    }

                    if (foundLaterIndex !== -1) {
                        const foundEl = yArray.get(foundLaterIndex) as CanvasElement

                        const currentIdInTarget = uniqueElements.findIndex((e, idx) => idx > i && e.id === currentEl.id)

                        if (currentIdInTarget !== -1) {
                            yArray.delete(foundLaterIndex, 1)
                            yArray.insert(yIndex, [targetEl])
                            yIndex++
                        } else {
                            yArray.delete(yIndex, 1)
                            i--
                        }
                    } else {
                        yArray.insert(yIndex, [targetEl])
                        yIndex++
                    }
                }
            }

            if (yIndex < yArray.length) {
                yArray.delete(yIndex, yArray.length - yIndex)
            }
        })
    }, [])

    const lastUpdateRef = useRef(0)

    const updateCursor = useCallback((x: number, y: number, activity?: any) => {
        if (wsRef.current?.readyState !== WebSocket.OPEN) return

        const now = Date.now()
        if (now - lastUpdateRef.current < 30) return
        lastUpdateRef.current = now

        const cursorData = {
            clientId: clientId,
            cursor: {
                clientId: clientId,
                x,
                y,
                name: user.name,
                color: user.color,
                isHost: isHost,
                isAnonymous: user.isAnonymous,
                activity
            }
        }

        const encryptAndSend = async () => {
            try {
                const encrypted = await encryptData(cursorData)
                wsRef.current?.send(JSON.stringify({
                    type: 'awareness',
                    clientId,
                    data: encrypted
                }))
            } catch (e) {
                console.error('Failed to send awareness', e)
            }
        }
        encryptAndSend()
    }, [user, clientId, isHost])

    return {
        status,
        setElements: setElementsYjs,
        remoteCursors,
        updateCursor,
        isHost,
        stopSession,
        leaveRoom,
        sessionEnded,
        clearSessionEnded: () => setSessionEnded(false),
        connectionFailed,
        clearConnectionFailed: () => setConnectionFailed(false),
        roomSettings,
        updateRoomSettings
    }
}