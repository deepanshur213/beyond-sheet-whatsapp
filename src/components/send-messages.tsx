import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import axios from 'axios'
import ProgressBar from "./progress";
import { format } from "date-fns";
import { ArrowUpRightFromSquare, Phone } from "lucide-react";
import { Input } from "./ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { z } from 'zod'
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ScrollArea } from "./ui/scroll-area";
import { useState } from "react";

const formSchema = z.object({
    header: z.string(),
    text: z.string().optional(),
    image: z.string().optional(),
    text1: z.string().min(1, { message: 'Text1 cant be empty' }),
    text2: z.string().optional(),
    text3: z.string().optional()
}).refine(data => data.header == 'text' ? data.text?.length : true, {
    message: 'Header cant be empty',
    path: ['text']
}).refine(data => data.header == 'image' ? data.image?.length : true, {
    message: 'Image is required',
    path: ['image']
})

type formType = z.infer<typeof formSchema>

export default function SendMessages({ numbers }: { numbers: string[] }) {

    const [progress, setProgress] = useState(0)
    const [errors, setErrors] = useState<any>([])

    const form = useForm<formType>({
        resolver: zodResolver(formSchema),
    })

    async function uploadImage(base64String: string) {
        const byteString = atob(base64String.split(',')[1]); // Decode Base64 string
        const mimeString = base64String.split(',')[0].split(':')[1].split(';')[0]; // Get the MIME type
        const ab = new ArrayBuffer(byteString.length); // Create an ArrayBuffer
        const ia = new Uint8Array(ab); // Create a typed array

        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i); // Fill the typed array with byte values
        }

        // Generate a default filename based on the current timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); // Format timestamp
        const defaultFileName = `file_${timestamp}.${mimeString.split('/')[1]}`; // Generate filename


        const file = new File([ab], defaultFileName, { type: mimeString });

        // Create FormData to send the file
        const formData = new FormData();
        formData.append('file', file); // Append the file to the FormData
        formData.append('type', mimeString),
            formData.append('messaging_product', 'whatsapp')

        try {
            // Make the Axios POST request to upload the file
            const response = await axios.post('https://graph.facebook.com/v21.0/422388817629688/media', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data', // Set the correct content type
                    Authorization: `Bearer ${import.meta.env.VITE_WHATSAPP_TOKEN}`
                }
            });
            if (response.status == 200) {
                return response.data.id
            }
            else {
                throw new Error('Error uploading file')
            }
        } catch (error) {
            throw new Error('Error uploading file')
        }

    }


    async function sendMessage(data: formType, number: string) {
        if (data.header === 'image') {
            data.image = await uploadImage(data.image!)
        }

        let query: any = {
            messaging_product: "whatsapp",
            to: `91${number}`,
            type: "template",
            template: {
                name: `${data.header}_text1${data.text1 && data.text2 ? '_text2' : ''}${data.text1 && data.text2 && data.text3 ? '_text3' : ''}`,
                language: {
                    code: "en"
                },
            }
        }

        let headerParameters
        let bodyParameters = [
            {
                type: "text",
                text: data.text1
            }
        ]

        // Conditionally update the header
        if (data.header === 'image') {
            headerParameters = [
                {
                    type: "image",  // Set the type to 'image'
                    image: {
                        id: data.image  // Add the image link from data.image
                    }
                }
            ];
        } else if (data.header === 'text') {
            headerParameters = [
                {
                    type: "text",  // Set the type to 'text'
                    text: data.text  // Add the text from data.text
                }
            ];
        }

        // conditionally add text2 and text3
        if (data.text2) {
            bodyParameters.push({
                type: "text",
                text: data.text2
            });
        }
        if (data.text3) {
            bodyParameters.push({
                type: "text",
                text: data.text3
            });
        }

        query.template.components = [
            {
                type: "header",
                parameters: headerParameters
            },
            {
                type: "body",
                parameters: bodyParameters
            }
        ]

        const res = await axios.post('https://graph.facebook.com/v21.0/422388817629688/messages',
            query,
            {
                headers: {
                    Authorization: `Bearer ${import.meta.env.VITE_WHATSAPP_TOKEN}`
                }
            }
        )
        if (res.status == 200) {
            console.log('Message Sent')
        }
        else {
            throw res
        }
        return
    }

    // async function sendTestMessage(data: formType, number: string) {
    //     await new Promise(resolve => setTimeout(resolve, 5));
    //     if (Math.random() < 0.1) {
    //         throw {error: 'Test error'};
    //     }
    //     return
    // }

    async function onSubmit(data: formType) {
        setProgress(0)
        setErrors([])
        for (let i = 0; i < numbers.length; i++) {
            try {
                await sendMessage(data, numbers[i])
            } catch (error:any) {
                setErrors((prev: any) => [...prev, { number: numbers[i], error: error }])
            }
            setProgress(prev=>prev+1)
        }

        if (errors.length > 0) {
            downloadErrorsAsJSON(errors);
        }

        setProgress(0)
    }

    function downloadErrorsAsJSON(errors: any[]) {
        const errorData = JSON.stringify(errors, null, 2);  // Convert errors to pretty-printed JSON string
    
        // Create a Blob from the JSON string
        const blob = new Blob([errorData], { type: 'application/json' });
    
        // Create a download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'errors.json';  // Filename for the downloaded file
    
        // Programmatically trigger a click to download the file
        a.click();
    
        // Clean up the URL object
        URL.revokeObjectURL(url);
    }

    return (
        <>
            {progress>0&&<ProgressBar progress={progress} numbers={numbers} errors={errors}/>}
            <Dialog>
                <DialogTrigger asChild>
                    <Button>Send Messages</Button>
                </DialogTrigger>
                <DialogContent className="max-w-max">
                    <DialogHeader>
                        <DialogTitle>
                            Send Messages
                        </DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="max-h-[70vh]">
                        <div className="flex flex-col md:flex-row gap-2">
                            <div className="md:w-1/2">
                                <Form {...form} >
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">

                                        <FormField
                                            control={form.control}
                                            name="header"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Header</FormLabel>
                                                    <FormControl>
                                                        <Select value={field.value} onValueChange={field.onChange}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder='Header Type' />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectGroup>
                                                                    <SelectItem value="image">Image</SelectItem>
                                                                    <SelectItem value="text">Text</SelectItem>
                                                                </SelectGroup>
                                                            </SelectContent>
                                                        </Select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {
                                            form.watch('header') == 'text' ?
                                                <FormField
                                                    control={form.control}
                                                    name="text"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Header</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                /> : null
                                        }

                                        {
                                            form.watch('header') == 'image' ?
                                                <FormField
                                                    control={form.control}
                                                    name="image"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Image</FormLabel>
                                                            <FormControl>
                                                                <Input type="file"
                                                                    onChange={(e) => {
                                                                        const file = e.target.files?.[0]; // Get the selected file
                                                                        if (file) {
                                                                            const reader = new FileReader();
                                                                            reader.onloadend = () => {
                                                                                field.onChange(reader.result); // Base64 string is available here
                                                                            };
                                                                            reader.readAsDataURL(file); // Convert the file to base64 string
                                                                        }
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                /> : null
                                        }

                                        <FormField
                                            control={form.control}
                                            name="text1"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Text1</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {form.watch('text1') &&
                                            <FormField
                                                control={form.control}
                                                name="text2"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Text2</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        }
                                        {form.watch('text1') && form.watch('text2') &&
                                            <FormField
                                                control={form.control}
                                                name="text3"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Text3</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        }


                                        <Button type="submit">Send</Button>
                                    </form>
                                </Form>
                            </div>
                            <div className="md:w-1/2 bg-stone-300 p-2 pl-5">

                                <div className="relative bg-white rounded-r-sm rounded-b-sm text-xs max-w-96">
                                    <div className="p-2">
                                        {form.watch('header') == 'image' ? <><img src={form.watch('image')} alt="image" className="w-full aspect-square h-40 object-cover rounded-lg" /><br /></> : null}
                                        {form.watch('header') == 'text' ? <><div className="font-bold text-md">
                                            {form.watch('text')}
                                        </div><br /></> : null}
                                        <div>
                                            {form.watch('text1')}
                                        </div>
                                        <br />
                                        {form.watch('text2') ? <><div>
                                            {form.watch('text2')}
                                        </div><br /></> : null}
                                        {form.watch('text3') ? <><div>
                                            {form.watch('text3')}
                                        </div><br /></> : null}
                                        <div>
                                            If you have any queries, please click on Live Chat⬇️
                                        </div>
                                        <div className="flex justify-between text-gray-400 py-2">
                                            <div className="text-gray-400">BeyondJustWork</div>
                                            <div>{format(new Date(), 'hh:MM a')}</div>
                                        </div>
                                        <hr />
                                        <div className="flex gap-2 text-blue-500 py-3 justify-center">
                                            <ArrowUpRightFromSquare className="w-4 h-4" />Live Chat
                                        </div>
                                        <hr />
                                        <div className="flex gap-2 text-blue-500 py-3 justify-center">
                                            <ArrowUpRightFromSquare className="w-4 h-4" />Visit website
                                        </div>
                                        <hr />
                                        <div className="flex gap-2 text-blue-500 py-3 justify-center">
                                            <Phone className="w-4 h-4" />Contact Us
                                        </div>
                                    </div>
                                    <div className="absolute top-0 -left-[13px] w-0 h-0 border-t-[15px] border-t-white border-l-[15px] border-l-transparent border-b-0 border-r-0"></div>

                                </div>

                            </div>
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </>
    )
}