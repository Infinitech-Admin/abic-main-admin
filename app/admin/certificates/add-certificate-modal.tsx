import React, { useState } from 'react';
import { Button } from "@heroui/react";
import { Formik, Form, } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

import { Modal } from '@/components/add-modal';
import CustomInput from '@/components/input';
import toast from 'react-hot-toast';

const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    date: Yup.string().required('Date is required'),
    image: Yup.mixed()
        .required('Image is required')
        .test('fileType', 'Only image files are allowed', (value) => {
            if (!value) return false;
            return value && ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes((value as File).type);
        }),
});

interface AddModalProps {
    mutate: () => void;
    className?:string;
}

const AddTestimonialModal: React.FC<AddModalProps> = ({ mutate }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>();
    const handleSubmit = async (
        values: { user_id: string; name: string; date: string, image: File | null },
        { setSubmitting, resetForm }: { setSubmitting: (isSubmitting: boolean) => void, resetForm: () => void }
    ) => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BASE_URL}/api/certificates`,
                values,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            toast.success('Operation successful!');
            mutate();
            resetForm();
            const imageInput = document.querySelector('input[name="image"]') as HTMLInputElement | null;
            if (imageInput) {
                imageInput.value = '';
            }
            setIsOpen(false);
        } catch (error) {
            toast.error('Something went wrong.');
            console.error('Error adding Testimonial:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const user_id = sessionStorage.getItem('id') || '';

    return (
        <Modal title="Add certificate" buttonLabel="Add certificate" isOpen={isOpen} setIsOpen={setIsOpen}>
            <div className="min-w-full">
                <Formik
                    initialValues={{
                        user_id,
                        name: '',
                        date: '',
                        image: null,
                    }}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ errors, touched, isSubmitting, setFieldValue }) => (
                        <Form className="space-y-4">
                            <CustomInput
                                name="name"
                                label="Name"
                                type="text"
                                error={touched.name ? errors.name : undefined}
                            />
                            <CustomInput
                                name="date"
                                label="Date"
                                type="date"
                                error={touched.date ? errors.date : undefined}
                            />
                            <CustomInput
                                name="image"
                                label="Image"
                                type="file"
                                error={touched.image ? errors.image : undefined}
                                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                    const file = event.target.files?.[0];
                                    setFieldValue('image', file);
                                    if (file) {
                                        const imageUrl = URL.createObjectURL(file);
                                        setImagePreview(imageUrl);
                                    }
                                }}
                            />
                            {imagePreview && (
                                <div className="mt-2">
                                    <p className="text-gray-600 text-sm">Image Preview:</p>
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="mt-1 w-full h-32 object-cover justify-center rounded-lg border"
                                    />
                                </div>
                            )}
                            <Button
                                type="submit"
                                color="primary"
                                className="w-full"
                                isLoading={isSubmitting}
                                isDisabled={isSubmitting}
                            >
                                Submit
                            </Button>
                        </Form>
                    )}
                </Formik>
            </div>
        </Modal>
    );
};

export default AddTestimonialModal;