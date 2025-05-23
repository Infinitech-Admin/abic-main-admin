"use client";

import { format } from "date-fns"; // Import date-fns format function
import useSWR from "swr";
import { useEffect, useState } from "react";

import { DataTable } from "@/components/data-table";
import { Column, Certificate } from "@/app/utils/types";
import LoadingDot from "@/components/loading-dot";
import { Card, CardBody } from "@heroui/react";
import AddTestimonialModal from "../certificates/add-certificate-modal";
import EditCertificateModal from "../certificates/edit-certificate-modal";
import DeleteCertificateModal from "../certificates/delete-certificate-modal";

// Utils
import fetchWithToken from "@/app/utils/fetch-with-token";

const columns: Column<Certificate>[] = [
  // { key: 'id', label: 'ID' },
  // { key: 'user_id', label: 'User ID' },
  { key: "name", label: "Name" },
  {
    key: "date",
    label: "Date",
    render: (certificate) => {
      // Format the date here using date-fns
      const formattedDate = format(new Date(certificate.date), "dd-MMMM-yyyy");
      return <span>{formattedDate}</span>;
    },
  },
  {
    key: "image",
    label: "Logo",
    render: (certificate) => (
      <img
        src={`https://abic-agent-bakit.s3.ap-southeast-1.amazonaws.com/certificates/${certificate.image}`}
        alt={certificate.image}
        className="h-12 w-12 object-contain"
      />
    ),
  },
];

export default function Certificates() {
  const { data, error, mutate } = useSWR<{
    code: number;
    message: string;
    records: Certificate[];
  }>(`${process.env.NEXT_PUBLIC_BASE_URL}/api/certificates`, fetchWithToken);

  const [certificates, setTestimonials] = useState<Certificate[]>([]);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCertificate, setSelectedTestimonial] =
    useState<Certificate | null>(null);

  useEffect(() => {
    if (data && data.records) {
      setTestimonials(data.records);
    }
  }, [data]);

  const handleAction = (certificate: Certificate) => {
    setSelectedTestimonial(certificate);
    setEditModalOpen(true);
  };

  const handleDelete = (certificate: Certificate) => {
    setSelectedTestimonial(certificate);
    setDeleteModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedTestimonial(null);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedTestimonial(null);
  };

  if (error) {
    return <div className="text-red-500">Error: {error.message}</div>;
  }

  if (!data) {
    return <LoadingDot />;
  }

  return (
    <section>
      <div>
        <DataTable<Certificate>
          data={certificates}
          columns={columns}
          itemsPerPage={5}
          onAction={handleAction}
          onDelete={handleDelete}
        />
      </div>

      {selectedCertificate && (
        <EditCertificateModal
          certificate={selectedCertificate}
          isOpen={isEditModalOpen}
          mutate={mutate}
          onClose={handleCloseEditModal}
        />
      )}

      {selectedCertificate && (
        <DeleteCertificateModal
          certificate={selectedCertificate}
          isOpen={isDeleteModalOpen}
          mutate={mutate}
          onClose={handleCloseDeleteModal}
        />
      )}
    </section>
  );
}
