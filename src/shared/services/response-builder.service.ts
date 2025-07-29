import { Injectable } from '@nestjs/common';
import { 
  ApiResponse, 
  ApiErrorResponse, 
  HATEOASLinks, 
  HATEOASLink,
  LinkContext,
  PaginationMeta,
  ValidationError 
} from '../types';

@Injectable()
export class ResponseBuilderService {
  private readonly version = '1.0.0';

  /**
   * Build a standardized success response
   */
  buildSuccessResponse<T>(
    data: T,
    message: string,
    statusCode: number,
    traceId: string,
    links: HATEOASLinks,
    pagination?: PaginationMeta
  ): ApiResponse<T> {
    return {
      success: true,
      statusCode,
      message,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        traceId,
        version: this.version,
        pagination
      },
      links
    };
  }

  /**
   * Build a standardized error response
   */
  buildErrorResponse(
    code: string,
    message: string,
    statusCode: number,
    traceId: string,
    selfUrl: string,
    details?: ValidationError[] | string,
    hint?: string
  ): ApiErrorResponse {
    return {
      success: false,
      statusCode,
      error: {
        code,
        message,
        details,
        hint
      },
      meta: {
        timestamp: new Date().toISOString(),
        traceId,
        version: this.version
      },
      links: {
        self: selfUrl,
        documentation: '/api/docs'
      }
    };
  }

  /**
   * Generate HATEOAS links for a resource
   */
  generateHATEOASLinks(context: LinkContext): HATEOASLinks {
    const { baseUrl, resourceId } = context;
    
    const links: HATEOASLinks = {
      self: resourceId ? `${baseUrl}/${resourceId}` : baseUrl
    };

    // Add related resource links if resourceId is provided
    if (resourceId) {
      links.related = {
        update: {
          href: `${baseUrl}/${resourceId}`,
          method: 'PUT',
          rel: 'update'
        },
        delete: {
          href: `${baseUrl}/${resourceId}`,
          method: 'DELETE',
          rel: 'delete'
        },
        collection: {
          href: baseUrl,
          method: 'GET',
          rel: 'collection'
        }
      };
    } else {
      // For collection endpoints
      links.related = {
        create: {
          href: baseUrl,
          method: 'POST',
          rel: 'create'
        }
      };
    }

    // Add pagination links if context includes pagination info
    if (context.currentPage !== undefined) {
      links.pagination = this.generatePaginationLinks(context);
    }

    return links;
  }

  /**
   * Generate pagination links
   */
  private generatePaginationLinks(context: LinkContext): { [key: string]: string } {
    const { baseUrl, currentPage, totalPages, hasNext, hasPrev } = context;
    const paginationLinks: { [key: string]: string } = {};

    // First page link
    paginationLinks.first = `${baseUrl}?page=1`;
    
    // Last page link
    if (totalPages) {
      paginationLinks.last = `${baseUrl}?page=${totalPages}`;
    }

    // Previous page link
    if (hasPrev && currentPage && currentPage > 1) {
      paginationLinks.prev = `${baseUrl}?page=${currentPage - 1}`;
    }

    // Next page link
    if (hasNext && currentPage) {
      paginationLinks.next = `${baseUrl}?page=${currentPage + 1}`;
    }

    return paginationLinks;
  }

  /**
   * Create a HATEOAS link object
   */
  createLink(href: string, method: string, rel: string, type?: string): HATEOASLink {
    return {
      href,
      method,
      rel,
      type
    };
  }

  /**
   * Generate metadata for responses
   */
  generateMetadata(traceId: string, pagination?: PaginationMeta) {
    return {
      timestamp: new Date().toISOString(),
      traceId,
      version: this.version,
      pagination
    };
  }

  /**
   * Build pagination metadata
   */
  buildPaginationMeta(
    currentPage: number,
    totalItems: number,
    itemsPerPage: number
  ): PaginationMeta {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    return {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1
    };
  }

  /**
   * Build validation error details
   */
  buildValidationErrors(errors: any[]): ValidationError[] {
    return errors.map(error => ({
      field: error.property || 'unknown',
      message: error.constraints ? Object.values(error.constraints)[0] as string : error.message,
      value: error.value,
      constraint: error.constraints ? Object.keys(error.constraints)[0] : undefined
    }));
  }
}