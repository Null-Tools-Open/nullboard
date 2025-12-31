'use client'

import { useState, useEffect, useCallback } from 'react'
import { CanvasElement } from '@/components/canvas/shared'

export interface Workspace {
    id: string
    name: string
    createdAt: number
    lastModified: number
}

const STORAGE_KEY_WORKSPACES = 'workspaces'
const STORAGE_PREFIX_DATA = 'workspace_data_'
const DEFAULT_WORKSPACE_ID = 'default'

export function useWorkspaces() {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([])
    const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(DEFAULT_WORKSPACE_ID)
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        const savedWorkspaces = localStorage.getItem(STORAGE_KEY_WORKSPACES)
        let parsedWorkspaces: Workspace[] = []

        if (savedWorkspaces) {
            try {
                parsedWorkspaces = JSON.parse(savedWorkspaces)
            } catch (e) {
                console.error('Failed to parse workspaces', e)
            }
        }

        if (parsedWorkspaces.length === 0) {
            const defaultWorkspace: Workspace = {
                id: DEFAULT_WORKSPACE_ID,
                name: 'Default',
                createdAt: Date.now(),
                lastModified: Date.now()
            }
            parsedWorkspaces = [defaultWorkspace]
            localStorage.setItem(STORAGE_KEY_WORKSPACES, JSON.stringify(parsedWorkspaces))
        }

        setWorkspaces(parsedWorkspaces)

        const savedActiveId = localStorage.getItem('active_workspace_id')
        if (savedActiveId && parsedWorkspaces.some(w => w.id === savedActiveId)) {
            setActiveWorkspaceId(savedActiveId)
        } else {
            setActiveWorkspaceId(parsedWorkspaces[0].id)
        }

        setIsLoaded(true)
    }, [])

    const saveWorkspaces = useCallback((newWorkspaces: Workspace[]) => {
        setWorkspaces(newWorkspaces)
        localStorage.setItem(STORAGE_KEY_WORKSPACES, JSON.stringify(newWorkspaces))
    }, [])

    const createWorkspace = useCallback((name: string) => {
        const newWorkspace: Workspace = {
            id: crypto.randomUUID(),
            name,
            createdAt: Date.now(),
            lastModified: Date.now()
        }
        const updatedWorkspaces = [...workspaces, newWorkspace]
        saveWorkspaces(updatedWorkspaces)
        return newWorkspace.id
    }, [workspaces, saveWorkspaces])

    const deleteWorkspace = useCallback((id: string) => {
        if (workspaces.length <= 1) {
            return
        }

        const updatedWorkspaces = workspaces.filter(w => w.id !== id)
        saveWorkspaces(updatedWorkspaces)

        localStorage.removeItem(STORAGE_PREFIX_DATA + id)

        if (activeWorkspaceId === id) {
            const nextId = updatedWorkspaces[0].id
            setActiveWorkspaceId(nextId)
            localStorage.setItem('active_workspace_id', nextId)
        }
    }, [workspaces, activeWorkspaceId, saveWorkspaces])

    const switchWorkspace = useCallback((id: string) => {
        if (workspaces.some(w => w.id === id)) {
            setActiveWorkspaceId(id)
            localStorage.setItem('active_workspace_id', id)
        }
    }, [workspaces])

    const saveWorkspaceData = useCallback((id: string, elements: CanvasElement[]) => {
        localStorage.setItem(STORAGE_PREFIX_DATA + id, JSON.stringify({
            elements,
            timestamp: Date.now()
        }))

        setWorkspaces(prev => {
            const newWorkspaces = prev.map(w =>
                w.id === id ? { ...w, lastModified: Date.now() } : w
            )
            return newWorkspaces
        })
    }, [])

    const loadWorkspaceData = useCallback((id: string): CanvasElement[] => {
        const data = localStorage.getItem(STORAGE_PREFIX_DATA + id)
        if (data) {
            try {
                const parsed = JSON.parse(data)
                return parsed.elements || []
            } catch (e) {
                console.error('Failed to load workspace data', e)
                return []
            }
        }
        return []
    }, [])

    return {
        workspaces,
        activeWorkspaceId,
        createWorkspace,
        deleteWorkspace,
        switchWorkspace,
        saveWorkspaceData,
        loadWorkspaceData,
        isLoaded
    }
}