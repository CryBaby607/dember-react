export const BOOKING_STATUS = {
    NEW: 'new',
    SCHEDULED: 'scheduled',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
};

export const STATUS_CONFIG = {
    [BOOKING_STATUS.NEW]: {
        label: 'Nueva Cita',
        icon: 'Sparkles',
        modal: {
            headerBg: 'bg-violet-600',
            subText: 'text-violet-100',
            badge: 'text-violet-50 bg-white/20'
        },
        grid: {
            // New: Violet theme, clean
            className: 'bg-white hover:bg-violet-50/50 border-l-violet-500 border-l-[4px] border-y border-r border-slate-200/60 shadow-sm'
        },
        text: {
            primary: 'text-slate-900 font-semibold',
            secondary: 'text-violet-600 font-medium',
            tertiary: 'text-slate-400'
        }
    },
    [BOOKING_STATUS.SCHEDULED]: {
        label: 'Programada',
        modalLabel: 'Detalles de Cita',
        icon: null, // Standard state, no icon to reduce noise
        modal: {
            headerBg: 'bg-indigo-600',
            subText: 'text-indigo-100',
            badge: 'text-indigo-50 bg-white/20'
        },
        grid: {
            // Scheduled: Standard Active, cleanly defined
            className: 'bg-white hover:bg-indigo-50/30 border-l-indigo-500 border-l-[4px] border-y border-r border-slate-200/50'
        },
        text: {
            primary: 'text-slate-900 font-semibold',
            secondary: 'text-indigo-600 font-medium',
            tertiary: 'text-slate-400'
        }
    },
    [BOOKING_STATUS.IN_PROGRESS]: {
        label: 'En Progreso',
        modalLabel: 'Cita en Progreso',
        icon: 'PlayCircle', // Active action
        modal: {
            headerBg: 'bg-amber-500',
            subText: 'text-amber-100',
            badge: 'text-amber-50 bg-white/20'
        },
        grid: {
            // In Progress: Highlighted (Ring + Shadow)
            className: 'bg-white border-l-amber-500 border-l-[4px] ring-1 ring-amber-500/50 shadow-[0_4px_12px_-4px_rgba(245,158,11,0.2)] z-20'
        },
        text: {
            primary: 'text-slate-900 font-bold tracking-tight',
            secondary: 'text-amber-600 font-bold uppercase text-[10px]',
            tertiary: 'text-slate-500'
        }
    },
    [BOOKING_STATUS.COMPLETED]: {
        label: 'Completada',
        modalLabel: 'Cita Completada',
        icon: 'CheckCircle2', // Success
        modal: {
            headerBg: 'bg-emerald-600',
            subText: 'text-emerald-100',
            badge: 'text-emerald-50 bg-white/20'
        },
        grid: {
            // Completed: Recessive, flat, distinct
            className: 'bg-slate-50 border-l-emerald-500/60 border-l-[3px] border-y border-r border-slate-200/50 opacity-90'
        },
        text: {
            primary: 'text-slate-600 font-medium',
            secondary: 'text-emerald-600/80 font-medium',
            tertiary: 'text-slate-400'
        }
    },
    [BOOKING_STATUS.CANCELLED]: {
        label: 'Cancelada',
        modalLabel: 'Cita Cancelada',
        icon: 'XCircle', // Negative
        modal: {
            headerBg: 'bg-zinc-500',
            subText: 'text-zinc-100',
            badge: 'text-zinc-50 bg-white/20'
        },
        grid: {
            // Cancelled: Ghost, striped
            className: 'bg-slate-50 border-l-slate-300 border-l-[2px] border-y border-r border-slate-100 opacity-60 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,rgba(203,213,225,0.1)_5px,rgba(203,213,225,0.1)_10px)]'
        },
        text: {
            primary: 'text-slate-400 font-normal italic line-through decoration-slate-300',
            secondary: 'text-slate-400 italic',
            tertiary: 'text-slate-300'
        }
    }
};

export function getStatusConfig(status) {
    return STATUS_CONFIG[status] || STATUS_CONFIG[BOOKING_STATUS.SCHEDULED];
}
