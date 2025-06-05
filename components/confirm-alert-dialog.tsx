"use client"

import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogCancel, AlertDialogTitle, AlertDialogDescription, AlertDialogAction } from "@/components/ui/alert-dialog"

interface ConfirmAlertDialogProps {
 children: React.ReactNode
 title: string
 description: string
 confirmText?: string
 cancelText?: string
 onConfirm: () => void
}

export function ConfirmAlertDialog({
 children,
 title,
 description,
 confirmText = "Confirmar",
 cancelText = "Cancelar",
 onConfirm,
}: ConfirmAlertDialogProps) {
 return (
  <AlertDialog>
   <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
   <AlertDialogContent>
    <AlertDialogHeader>
     <AlertDialogTitle>{title}</AlertDialogTitle>
     <AlertDialogDescription>{description}</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
     <AlertDialogCancel>{cancelText}</AlertDialogCancel>
     <AlertDialogAction onClick={onConfirm}>{confirmText}</AlertDialogAction>
    </AlertDialogFooter>
   </AlertDialogContent>
  </AlertDialog>
 )
}
