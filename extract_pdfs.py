#!/usr/bin/env python3
"""
PDF Content Extraction Script for Snowva System Documents
"""
import pdfplumber
import os
import sys
from pathlib import Path


def extract_pdf_content(pdf_path):
    """Extract text content from a PDF file"""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            text_content = ""
            for page_num, page in enumerate(pdf.pages, 1):
                text = page.extract_text()
                if text:
                    text_content += f"\n--- Page {page_num} ---\n"
                    text_content += text

                # Also try to extract tables
                tables = page.extract_tables()
                if tables:
                    text_content += f"\n--- Tables on Page {page_num} ---\n"
                    for table_num, table in enumerate(tables, 1):
                        text_content += f"\nTable {table_num}:\n"
                        for row in table:
                            if row:  # Skip empty rows
                                text_content += (
                                    " | ".join(
                                        str(cell) if cell else "" for cell in row
                                    )
                                    + "\n"
                                )

            return text_content.strip()
    except Exception as e:
        return f"Error extracting PDF: {str(e)}"


def main():
    # Path to the docs/system-current directory
    docs_path = Path("docs/system-current")

    if not docs_path.exists():
        print(f"Directory not found: {docs_path}")
        return

    # Get all PDF files
    pdf_files = list(docs_path.glob("*.pdf"))

    if not pdf_files:
        print(f"No PDF files found in {docs_path}")
        return

    print(f"Found {len(pdf_files)} PDF files:")
    for pdf_file in pdf_files:
        print(f"  - {pdf_file.name}")

    # Extract content from each PDF
    for pdf_file in pdf_files:
        print(f"\n{'='*60}")
        print(f"EXTRACTING: {pdf_file.name}")
        print(f"{'='*60}")

        content = extract_pdf_content(pdf_file)
        print(content)

        # Also save to text file
        output_file = pdf_file.with_suffix(".txt")
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"\n[Content saved to: {output_file}]")


if __name__ == "__main__":
    main()
