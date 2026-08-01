
"use client";

import { Button } from "@/components/ui/button"
// import { createPlayground } from "@/features/playground/actions";
import { Plus } from 'lucide-react'
import Image from "next/image"
import { useRouter } from "next/navigation";
import { useState } from "react"
import { toast } from "sonner";
import TemplateSelectingModal from "./template-selecting-modal";
import { createPlayground } from "../actions";

const AddNewButton = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<{
        title: string;
        template: "REACT" | "NEXTJS" | "EXPRESS" | "VUE" | "HONO" | "ANGULAR";
        description?: string;
    } | null>(null)
    const router = useRouter()


    const handleSubmit = async (data: {
        title: string;
        template: "REACT" | "NEXTJS" | "EXPRESS" | "VUE" | "HONO" | "ANGULAR";
        description?: string;
    }) => {
        setSelectedTemplate(data)

        const res = await createPlayground(data);
        toast.success("Playground Created successfully")
        setIsModalOpen(false)
        router.push(`/playground/${res?.id}`)
    }


    return (
        <>
            <div
                onClick={() => setIsModalOpen(true)}
                className="group px-6 py-6 flex flex-row justify-between items-center border rounded-lg bg-muted cursor-pointer 
        transition-all duration-300 ease-in-out
        hover:bg-background hover:border-amber-500 hover:scale-[1.02]
        shadow-[0_2px_10px_rgba(0,0,0,0.08)]
        hover:shadow-[0_10px_30px_rgba(245,158,11,0.18)]"
            >
                <div className="flex flex-row justify-center items-start gap-4">
                    <Button
                        variant={"outline"}
                        className="flex justify-center items-center bg-white group-hover:bg-amber-50 dark:group-hover:bg-amber-500/10 group-hover:border-amber-500 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-300"
                        size={"icon"}
                    >
                        <Plus size={30} className="transition-transform duration-300 group-hover:rotate-90" />
                    </Button>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-bold bg-[linear-gradient(115deg,#fde68a,#f59e0b_50%,#d97706)] bg-clip-text text-transparent">Add New</h1>
                        <p className="text-sm text-muted-foreground max-w-55">Create a new playground</p>
                    </div>
                </div>

                <div className="relative overflow-hidden">
                    <Image
                        src={"/add-new.svg"}
                        alt="Create new playground"
                        width={150}
                        height={150}
                        className="transition-transform duration-300 group-hover:scale-110"
                    />
                </div>
            </div>
            <TemplateSelectingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
            />

        </>
    )
}

export default AddNewButton